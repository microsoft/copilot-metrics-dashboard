import {
  formatResponseError,
  unknownResponseError,
} from "@/features/common/response-error";
import {
  CopilotMetrics,
  CopilotUsageOutput,
} from "@/features/common/models";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { SqlQuerySpec } from "@azure/cosmos";
import { format } from "date-fns";
import { cosmosClient, cosmosConfiguration } from "./cosmos-db-service";
import { ensureGitHubEnvConfig } from "./env-service";
import { stringIsNullOrEmpty, applyTimeFrameLabel } from "../utils/helpers";
import { sampleData } from "./sample-data";

export interface IFilter {
  startDate?: Date;
  endDate?: Date;
  enterprise: string;
  organization: string;
  team: string;
}

export const getCopilotMetrics = async (
  filter: IFilter
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
    return getCopilotMetricsFromApi(filter);
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotMetricsFromApi = async (filter: IFilter): Promise<
  ServerActionResponse<CopilotUsageOutput[]>
> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { token, version } = env.response;

  try {
    if(filter.enterprise) {
      const response = await fetch(
        `https://api.github.com/enterprises/${filter.enterprise}/copilot/metrics`,
        {
          cache: "no-store",
          headers: {
            Accept: `application/vnd.github+json`,
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": version,
          },
        }
      );
  
      if (!response.ok) {
        return formatResponseError(filter.enterprise, response);
      }
  
      const data = await response.json();
      const dataWithTimeFrame = applyTimeFrameLabel(data);
      return {
        status: "OK",
        response: dataWithTimeFrame,
      };
    } else {
      const response = await fetch(
        `https://api.github.com/orgs/${filter.organization}/copilot/metrics`,
        {
          cache: "no-store",
          headers: {
            Accept: `application/vnd.github+json`,
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": version,
          },
        }
      );

      if (!response.ok) {
        return formatResponseError(filter.organization, response);
      }

      const data = await response.json();
      const dataWithTimeFrame = applyTimeFrameLabel(data);
      return {
        status: "OK",
        response: dataWithTimeFrame,
      };
    }
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
  
  if (filter.team) {
    querySpec.query += ` AND c.team = @team`;
    querySpec.parameters?.push({ name: "@team", value: filter.team });
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
