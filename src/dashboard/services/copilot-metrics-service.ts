/**
 * Copilot metrics service
 * -----------------------
 *
 * Sources Copilot usage data and shapes it into `CopilotUsageOutput[]` for
 * the dashboard UI. Three back-ends, in priority order:
 *
 *   1. CosmosDB           — when `AZURE_COSMOSDB_ENDPOINT` is set,
 *                           pre-ingested daily snapshots are queried.
 *   2. GitHub API (live)  — otherwise we hit GitHub directly:
 *                              a) /copilot/metrics/reports/users-28-day/latest
 *                                 returns one or more pre-signed download
 *                                 links to JSON or NDJSON files of per-user,
 *                                 per-day usage records.
 *                              b) /copilot/billing/seats provides the
 *                                 seat <-> team mapping so we can attribute
 *                                 each usage record to one or more teams.
 *                           The two are joined and rolled up by day.
 *   3. Sample data        — fallback used in `_getCopilotMetrics` for
 *                           local development without GitHub credentials.
 *
 * The aggregation contract preserved for the UI is `CopilotUsageOutput[]`,
 * one entry per (day, optional team) combination, with breakdowns by
 * language and IDE. The chat-vs-completion split is derived from feature
 * names (anything starting with `chat_` or containing `agent` is chat).
 */
import { formatResponseError, unknownResponseError } from "@/features/common/response-error";
import {
  Breakdown,
  CopilotMetrics,
  CopilotUsageOutput,
  SeatAssignment,
} from "@/features/common/models";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { SqlQuerySpec } from "@azure/cosmos";
import { format, startOfWeek } from "date-fns";
import { cosmosClient, cosmosConfiguration } from "./cosmos-db-service";
import { ensureGitHubEnvConfig } from "./env-service";
import {
  applyTimeFrameLabel,
  getNextUrlFromLinkHeader,
  stringIsNullOrEmpty,
} from "../utils/helpers";
import { sampleData } from "./sample-data";

export interface IFilter {
  startDate?: Date;
  endDate?: Date;
  enterprise: string;
  organization: string;
  team: string[];
}

interface UsageMetricsReportResponse {
  download_links: string[];
  report_start_day?: string;
  report_end_day?: string;
  report_day?: string;
}

interface UsageMetricsTotal {
  user_initiated_interaction_count?: number;
  code_generation_activity_count?: number;
  code_acceptance_activity_count?: number;
  loc_suggested_to_add_sum?: number;
  loc_suggested_to_delete_sum?: number;
  loc_added_sum?: number;
  loc_deleted_sum?: number;
}

interface UsageMetricsIdeTotal extends UsageMetricsTotal {
  ide: string;
}

interface UsageMetricsFeatureTotal extends UsageMetricsTotal {
  feature: string;
}

interface UsageMetricsLanguageFeatureTotal extends UsageMetricsTotal {
  language: string;
  feature: string;
}

interface UsageMetricsUserDayRecord extends UsageMetricsTotal {
  day: string;
  user_login: string;
  used_chat?: boolean;
  used_agent?: boolean;
  used_cli?: boolean;
  used_copilot_cloud_agent?: boolean;
  used_copilot_coding_agent?: boolean;
  totals_by_ide?: UsageMetricsIdeTotal[];
  totals_by_feature?: UsageMetricsFeatureTotal[];
  totals_by_language_feature?: UsageMetricsLanguageFeatureTotal[];
}

const CODE_COMPLETION_FEATURE = "code_completion";

const asNumber = (value?: number | null) => value ?? 0;

const totalSuggestedLines = (total: UsageMetricsTotal) =>
  asNumber(total.loc_suggested_to_add_sum) +
  asNumber(total.loc_suggested_to_delete_sum);

const totalAcceptedLines = (total: UsageMetricsTotal) =>
  asNumber(total.loc_added_sum) + asNumber(total.loc_deleted_sum);

const hasUsageActivity = (total: UsageMetricsTotal) =>
  asNumber(total.code_generation_activity_count) > 0 ||
  asNumber(total.code_acceptance_activity_count) > 0 ||
  totalSuggestedLines(total) > 0 ||
  totalAcceptedLines(total) > 0 ||
  asNumber(total.user_initiated_interaction_count) > 0;

const isChatFeature = (feature: string) =>
  feature.startsWith("chat_") || feature.includes("agent");

const scaleMetric = (value: number, factor: number) =>
  Number((value * factor).toFixed(4));

const getEntityName = (filter: IFilter) =>
  filter.enterprise || filter.organization;

const buildUsageUsersReportUrl = (filter: IFilter) => {
  if (filter.enterprise) {
    return `https://api.github.com/enterprises/${filter.enterprise}/copilot/metrics/reports/users-28-day/latest`;
  }

  return `https://api.github.com/orgs/${filter.organization}/copilot/metrics/reports/users-28-day/latest`;
};

const buildSeatsUrl = (filter: IFilter) => {
  if (filter.enterprise) {
    return `https://api.github.com/enterprises/${filter.enterprise}/copilot/billing/seats?per_page=100`;
  }

  return `https://api.github.com/orgs/${filter.organization}/copilot/billing/seats?per_page=100`;
};

const parseUsageUserReport = (
  rawReport: string,
): UsageMetricsUserDayRecord[] => {
  const trimmedReport = rawReport.trim();

  if (!trimmedReport) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmedReport);

    if (Array.isArray(parsed)) {
      return parsed as UsageMetricsUserDayRecord[];
    }

    return [parsed as UsageMetricsUserDayRecord];
  } catch {
    return trimmedReport
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as UsageMetricsUserDayRecord);
  }
};

const fetchGitHubJson = async <T>(
  url: string,
  token: string,
  version: string,
  entityName: string,
): Promise<ServerActionResponse<T>> => {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": version,
    },
  });

  if (!response.ok) {
    return formatResponseError(entityName, response);
  }

  return {
    status: "OK",
    response: (await response.json()) as T,
  };
};

const downloadUsageReport = async (
  downloadLink: string,
): Promise<ServerActionResponse<UsageMetricsUserDayRecord[]>> => {
  const response = await fetch(downloadLink, {
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      status: "ERROR",
      errors: [{ message: "Failed to download Copilot usage metrics report" }],
    };
  }

  const reportText = await response.text();

  return {
    status: "OK",
    response: parseUsageUserReport(reportText),
  };
};

const fetchUsageUserDayRecords = async (
  filter: IFilter,
  token: string,
  version: string,
): Promise<ServerActionResponse<UsageMetricsUserDayRecord[]>> => {
  const entityName = getEntityName(filter);
  const reportResponse = await fetchGitHubJson<UsageMetricsReportResponse>(
    buildUsageUsersReportUrl(filter),
    token,
    version,
    entityName,
  );

  if (reportResponse.status !== "OK") {
    return reportResponse;
  }

  const usageRecords: UsageMetricsUserDayRecord[] = [];

  for (const downloadLink of reportResponse.response.download_links || []) {
    const downloadResponse = await downloadUsageReport(downloadLink);

    if (downloadResponse.status !== "OK") {
      return downloadResponse;
    }

    usageRecords.push(...downloadResponse.response);
  }

  return {
    status: "OK",
    response: usageRecords.sort((left, right) =>
      left.day.localeCompare(right.day),
    ),
  };
};

const fetchSeatAssignments = async (
  filter: IFilter,
  token: string,
  version: string,
): Promise<ServerActionResponse<SeatAssignment[]>> => {
  const entityName = getEntityName(filter);
  const seats: SeatAssignment[] = [];
  let nextUrl = buildSeatsUrl(filter);

  while (!stringIsNullOrEmpty(nextUrl)) {
    const response = await fetch(nextUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": version,
      },
    });

    if (!response.ok) {
      return formatResponseError(entityName, response);
    }

    const data = await response.json();

    if (Array.isArray(data.seats)) {
      seats.push(...(data.seats as SeatAssignment[]));
    }

    nextUrl = getNextUrlFromLinkHeader(response.headers.get("Link")) || "";
  }

  return {
    status: "OK",
    response: seats,
  };
};

const buildUserTeamLookup = (seats: SeatAssignment[]) => {
  const lookup = new Map<string, Set<string>>();

  seats.forEach((seat) => {
    const login = seat.assignee?.login?.toLowerCase();
    const teamName = seat.assigning_team?.name;

    if (!login || !teamName) {
      return;
    }

    const teams = lookup.get(login) || new Set<string>();
    teams.add(teamName);
    lookup.set(login, teams);
  });

  return lookup;
};

const filterUsageRecordsByDate = (
  usageRecords: UsageMetricsUserDayRecord[],
  filter: IFilter,
) => {
  const startDay = filter.startDate
    ? format(filter.startDate, "yyyy-MM-dd")
    : undefined;
  const endDay = filter.endDate
    ? format(filter.endDate, "yyyy-MM-dd")
    : undefined;

  return usageRecords.filter((record) => {
    if (startDay && record.day < startDay) {
      return false;
    }

    if (endDay && record.day > endDay) {
      return false;
    }

    return true;
  });
};

const filterUsageRecordsByTeam = (
  usageRecords: UsageMetricsUserDayRecord[],
  selectedTeams: string[],
  teamLookup: Map<string, Set<string>>,
) => {
  if (selectedTeams.length === 0) {
    return usageRecords;
  }

  const selectedTeamSet = new Set(selectedTeams);

  return usageRecords.filter((record) => {
    const userTeams = teamLookup.get(record.user_login.toLowerCase());

    if (!userTeams) {
      return false;
    }

    for (const teamName of userTeams) {
      if (selectedTeamSet.has(teamName)) {
        return true;
      }
    }

    return false;
  });
};

const mergeBreakdowns = (breakdowns: Breakdown[]) => {
  const breakdownMap = new Map<string, Breakdown>();

  breakdowns.forEach((breakdown) => {
    const key = `${breakdown.language}::${breakdown.editor}::${breakdown.model}`;
    const existing = breakdownMap.get(key);

    if (existing) {
      existing.suggestions_count += breakdown.suggestions_count;
      existing.acceptances_count += breakdown.acceptances_count;
      existing.lines_suggested += breakdown.lines_suggested;
      existing.lines_accepted += breakdown.lines_accepted;
      existing.active_users += breakdown.active_users;
      return;
    }

    breakdownMap.set(key, { ...breakdown });
  });

  return Array.from(breakdownMap.values());
};

const buildCodeCompletionBreakdowns = (
  usageRecord: UsageMetricsUserDayRecord,
): Breakdown[] => {
  const languageTotals = (usageRecord.totals_by_language_feature || []).filter(
    (total) =>
      total.feature === CODE_COMPLETION_FEATURE && hasUsageActivity(total),
  );

  if (languageTotals.length === 0) {
    return [];
  }

  const ideTotals = (usageRecord.totals_by_ide || [])
    .filter(hasUsageActivity)
    .map((total) => {
      const weight =
        asNumber(total.code_generation_activity_count) ||
        asNumber(total.code_acceptance_activity_count) ||
        totalSuggestedLines(total) ||
        totalAcceptedLines(total) ||
        1;

      return {
        editor: total.ide.toLowerCase(),
        weight,
      };
    });

  const totalWeight = ideTotals.reduce((sum, total) => sum + total.weight, 0);
  const editorWeights =
    ideTotals.length > 0
      ? ideTotals.map((total) => ({
          editor: total.editor,
          factor:
            totalWeight > 0 ? total.weight / totalWeight : 1 / ideTotals.length,
        }))
      : [{ editor: "unknown", factor: 1 }];

  return languageTotals.flatMap((total) =>
    editorWeights.map(({ editor, factor }) => ({
      language: total.language.toLowerCase(),
      editor,
      model: "default",
      suggestions_count: scaleMetric(
        asNumber(total.code_generation_activity_count),
        factor,
      ),
      acceptances_count: scaleMetric(
        asNumber(total.code_acceptance_activity_count),
        factor,
      ),
      lines_suggested: scaleMetric(totalSuggestedLines(total), factor),
      lines_accepted: scaleMetric(totalAcceptedLines(total), factor),
      active_users: scaleMetric(1, factor),
    })),
  );
};

const isEngagedUsageRecord = (usageRecord: UsageMetricsUserDayRecord) =>
  asNumber(usageRecord.user_initiated_interaction_count) > 0 ||
  asNumber(usageRecord.code_acceptance_activity_count) > 0 ||
  isChatUsageRecord(usageRecord);

const isChatUsageRecord = (usageRecord: UsageMetricsUserDayRecord) =>
  Boolean(
    usageRecord.used_chat ||
    usageRecord.used_agent ||
    usageRecord.used_copilot_cloud_agent ||
    usageRecord.used_copilot_coding_agent ||
    (usageRecord.totals_by_feature || []).some(
      (featureTotal) =>
        isChatFeature(featureTotal.feature) && hasUsageActivity(featureTotal),
    ),
  );

const sumFeatureTotals = (
  usageRecord: UsageMetricsUserDayRecord,
  predicate: (feature: string) => boolean,
) => {
  return (usageRecord.totals_by_feature || [])
    .filter((featureTotal) => predicate(featureTotal.feature))
    .reduce(
      (totals, featureTotal) => {
        totals.userInteractions += asNumber(
          featureTotal.user_initiated_interaction_count,
        );
        totals.codeGeneration += asNumber(
          featureTotal.code_generation_activity_count,
        );
        totals.codeAcceptances += asNumber(
          featureTotal.code_acceptance_activity_count,
        );
        totals.linesSuggested += totalSuggestedLines(featureTotal);
        totals.linesAccepted += totalAcceptedLines(featureTotal);
        return totals;
      },
      {
        userInteractions: 0,
        codeGeneration: 0,
        codeAcceptances: 0,
        linesSuggested: 0,
        linesAccepted: 0,
      },
    );
};

const addUsageTimeFrameLabels = (
  usageOutputs: CopilotUsageOutput[],
): CopilotUsageOutput[] => {
  return [...usageOutputs]
    .sort((left, right) => left.day.localeCompare(right.day))
    .map((usageOutput) => {
      const date = new Date(usageOutput.day);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekIdentifier = format(weekStart, "MMM dd");
      const monthIdentifier = format(date, "MMM yy");

      return {
        ...usageOutput,
        time_frame_week: weekIdentifier,
        time_frame_month: monthIdentifier,
        time_frame_display: weekIdentifier,
      };
    });
};

const aggregateUsageRecordsByDay = (
  usageRecords: UsageMetricsUserDayRecord[],
): CopilotUsageOutput[] => {
  const recordsByDay = usageRecords.reduce((grouped, usageRecord) => {
    if (!grouped.has(usageRecord.day)) {
      grouped.set(usageRecord.day, []);
    }

    grouped.get(usageRecord.day)!.push(usageRecord);
    return grouped;
  }, new Map<string, UsageMetricsUserDayRecord[]>());

  const usageOutputs = Array.from(recordsByDay.entries()).map(
    ([day, dayRecords]) => {
      const activeUsers = new Set<string>();
      const engagedUsers = new Set<string>();
      const ideEngagedUsers = new Set<string>();
      const chatUsers = new Set<string>();
      const breakdowns: Breakdown[] = [];

      let totalCodeSuggestions = 0;
      let totalCodeAcceptances = 0;
      let totalCodeLinesSuggested = 0;
      let totalCodeLinesAccepted = 0;
      let totalChats = 0;
      let totalChatAcceptances = 0;

      dayRecords.forEach((usageRecord) => {
        const login = usageRecord.user_login.toLowerCase();
        activeUsers.add(login);

        if (isEngagedUsageRecord(usageRecord)) {
          engagedUsers.add(login);
        }

        const codeCompletionTotals = sumFeatureTotals(
          usageRecord,
          (feature) => feature === CODE_COMPLETION_FEATURE,
        );

        if (
          codeCompletionTotals.codeGeneration > 0 ||
          codeCompletionTotals.codeAcceptances > 0 ||
          codeCompletionTotals.linesSuggested > 0 ||
          codeCompletionTotals.linesAccepted > 0
        ) {
          ideEngagedUsers.add(login);
        }

        if (isChatUsageRecord(usageRecord)) {
          chatUsers.add(login);
        }

        totalCodeSuggestions += codeCompletionTotals.codeGeneration;
        totalCodeAcceptances += codeCompletionTotals.codeAcceptances;
        totalCodeLinesSuggested += codeCompletionTotals.linesSuggested;
        totalCodeLinesAccepted += codeCompletionTotals.linesAccepted;

        const chatTotals = sumFeatureTotals(usageRecord, isChatFeature);
        totalChats += chatTotals.userInteractions;
        totalChatAcceptances += chatTotals.codeAcceptances;

        breakdowns.push(...buildCodeCompletionBreakdowns(usageRecord));
      });

      return {
        total_active_users: activeUsers.size,
        total_engaged_users: engagedUsers.size,
        total_ide_engaged_users: ideEngagedUsers.size,
        total_code_suggestions: totalCodeSuggestions,
        total_code_acceptances: totalCodeAcceptances,
        total_code_lines_suggested: totalCodeLinesSuggested,
        total_code_lines_accepted: totalCodeLinesAccepted,
        total_chat_engaged_users: chatUsers.size,
        total_chats: totalChats,
        total_chat_insertion_events: totalChatAcceptances,
        total_chat_copy_events: 0,
        day,
        breakdown: mergeBreakdowns(breakdowns),
        time_frame_week: "",
        time_frame_month: "",
        time_frame_display: "",
      };
    },
  );

  return addUsageTimeFrameLabels(usageOutputs);
};

const getCopilotMetricsFromUsageReport = async (
  filter: IFilter,
  token: string,
  version: string,
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const usageRecordsResponse = await fetchUsageUserDayRecords(
    filter,
    token,
    version,
  );

  if (usageRecordsResponse.status !== "OK") {
    return usageRecordsResponse;
  }

  let usageRecords = filterUsageRecordsByDate(
    usageRecordsResponse.response,
    filter,
  );

  if (filter.team && filter.team.length > 0) {
    const seatAssignmentsResponse = await fetchSeatAssignments(
      filter,
      token,
      version,
    );

    if (seatAssignmentsResponse.status !== "OK") {
      return seatAssignmentsResponse;
    }

    usageRecords = filterUsageRecordsByTeam(
      usageRecords,
      filter.team,
      buildUserTeamLookup(seatAssignmentsResponse.response),
    );
  }

  return {
    status: "OK",
    response: aggregateUsageRecordsByDay(usageRecords),
  };
};

export const getCopilotMetrics = async (
  filter: IFilter,
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const env = ensureGitHubEnvConfig();
  const isCosmosConfig = cosmosConfiguration();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, organization } = env.response;

  try {
    switch (process.env.GITHUB_API_SCOPE) {
      case "enterprise":
        if (stringIsNullOrEmpty(filter.enterprise)) {
          filter.enterprise = enterprise;
        }
        break;
      default:
        if (stringIsNullOrEmpty(filter.organization)) {
          filter.organization = organization;
        }
        break;
    }
    if (isCosmosConfig) {
      return getCopilotMetricsFromDatabase(filter);
    }

    // If teams are specified, use the teams-specific API function
    if (filter.team && filter.team.length > 0) {
      return getCopilotTeamsMetricsFromApi(filter);
    }

    return getCopilotMetricsFromApi(filter);
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotMetricsFromApi = async (
  filter: IFilter,
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { token, version } = env.response;

  try {
    return getCopilotMetricsFromUsageReport(filter, token, version);
  } catch (e) {
    return unknownResponseError(e);
  }
};

/**
 * Fetches Copilot metrics for specific teams from the GitHub API
 * @param filter - Filter containing team names and date range
 * @returns Promise with combined metrics for all specified teams
 */
export const getCopilotTeamsMetricsFromApi = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { token, version } = env.response;

  try {
    return getCopilotMetricsFromUsageReport(filter, token, version);
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotMetricsFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotUsageOutput[]>> => {
  const client = cosmosClient();
  const database = client.database("platform-engineering");
  const container = database.container("metrics_history");

  let start = "";
  let end = "";
  const maxDays = 365 * 2; // maximum 2 years of data
  const maximumDays = 31;

  if (filter.startDate && filter.endDate) {
    start = format(filter.startDate, "yyyy-MM-dd");
    end = format(filter.endDate, "yyyy-MM-dd");
  } else {
    // set the start date to today and the end date to 31 days ago
    const todayDate = new Date();
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - maximumDays);

    start = format(startDate, "yyyy-MM-dd");
    end = format(todayDate, "yyyy-MM-dd");
  }

  let querySpec: SqlQuerySpec = {
    query: `SELECT * FROM c WHERE c.date >= @start AND c.date <= @end`,
    parameters: [
      { name: "@start", value: start },
      { name: "@end", value: end },
    ],
  };

  if (filter.enterprise) {
    querySpec.query += ` AND c.enterprise = @enterprise`;
    querySpec.parameters?.push({
      name: "@enterprise",
      value: filter.enterprise,
    });
  }

  if (filter.organization) {
    querySpec.query += ` AND c.organization = @organization`;
    querySpec.parameters?.push({
      name: "@organization",
      value: filter.organization,
    });
  }
  if (filter.team && filter.team.length > 0) {
    if (filter.team.length === 1) {
      querySpec.query += ` AND c.team = @team`;
      querySpec.parameters?.push({ name: "@team", value: filter.team[0] });
    } else {
      const teamConditions = filter.team
        .map((_, index) => `c.team = @team${index}`)
        .join(" OR ");
      querySpec.query += ` AND (${teamConditions})`;
      filter.team.forEach((team, index) => {
        querySpec.parameters?.push({ name: `@team${index}`, value: team });
      });
    }
  }else {
    querySpec.query += ` AND c.team = null`;
  }

  const { resources } = await container.items
    .query<CopilotMetrics>(querySpec, {
      maxItemCount: maxDays,
    })
    .fetchAll();

  const dataWithTimeFrame = applyTimeFrameLabel(resources);
  return {
    status: "OK",
    response: dataWithTimeFrame,
  };
};

export const _getCopilotMetrics = (): Promise<CopilotUsageOutput[]> => {
  const promise = new Promise<CopilotUsageOutput[]>((resolve) => {
    setTimeout(() => {
      const weekly = applyTimeFrameLabel(sampleData);
      resolve(weekly);
    }, 1000);
  });

  return promise;
};
