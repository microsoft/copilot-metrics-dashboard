import {
  formatResponseError,
  unknownResponseError,
} from "@/features/common/response-error";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { ensureGitHubEnvConfig } from "./env-service";

export interface EnterpriseResponse {
  total_seats: number;
  seats: SeatAssignment[];
}

export interface SeatAssignment {
  created_at: Date;
  updated_at: Date;
  pending_cancellation_date: Date;
  last_activity_at: Date;
  last_activity_editor: string;
  plan_type: string;
  // assignee: Assignee; - TODO
  // assugnee_team: AssigneeTeam; - TODO
}

export interface CopilotSeats {
  total_seats: number;
  seats: Seat[];
}

export interface SeatBreakdown {
  total: number;
  added_this_cycle: number;
  pending_invitation: number;
  pending_cancellation: number;
  active_this_cycle: number;
  inactive_this_cycle: number;
}

export interface SeatManagement {
  seat_breakdown: SeatBreakdown;
  seat_management_setting:
    | "assign_all"
    | "assign_selected"
    | "disabled"
    | "unconfigured";
  public_code_suggestions: "block" | "allow" | "unconfigured" | "unknown";
}

export interface Assignee {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface AssigningTeam {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  name: string;
  slug: string;
  description: string;
  privacy: string;
  notification_setting: string;
  permission: string;
  members_url: string;
  repositories_url: string;
  parent: null | string;
}

export interface Seat {
  created_at: string;
  updated_at: string;
  pending_cancellation_date: string | null;
  last_activity_at: string;
  last_activity_editor: string;
  plan_type: string;
  assignee: Assignee;
  assigning_team: AssigningTeam;
}

export const getCopilotSeats = async (): Promise<
  ServerActionResponse<SeatManagement>
> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { enterprise, organization, token, version } = env.response;

  try {

    switch (process.env.GITHUB_API_SCOPE) {

      case "enterprise":
        const enterpriseResponse = await fetch(
          `https://api.github.com/enterprises/${enterprise}/copilot/billing/seats`,
          {
            cache: "no-store",
            headers: {
              Accept: `application/vnd.github+json`,
              Authorization: `Bearer ${token}`,
              "X-GitHub-Api-Version": version,
            },
          }
        );

        if (!enterpriseResponse.ok) {
          return formatResponseError(enterprise, enterpriseResponse);
        }

        const enterpriseData = await enterpriseResponse.json();
        const enterpriseSeats = enterpriseData as EnterpriseResponse;

        // Copilot seats are considered active if they have been active in the last 30 days
        const activeSeats = enterpriseSeats.seats.filter(seat => {
          const lastActivityDate = new Date(seat.last_activity_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastActivityDate >= thirtyDaysAgo;
        });

        return {
          status: "OK",
          response: {
            seat_breakdown: {
              total: enterpriseSeats.total_seats,
              active_this_cycle: activeSeats.length,
              inactive_this_cycle: enterpriseSeats.total_seats - activeSeats.length,
            }
          } as SeatManagement,
        };
        break;

      default:
        const response = await fetch(
          `https://api.github.com/orgs/${organization}/copilot/billing`,
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
          return formatResponseError(organization, response);
        }

        const data = await response.json();
        return {
          status: "OK",
          response: data as SeatManagement,
        };
        break;
    }
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotSeatsAssignment = async (): Promise<ServerActionResponse<CopilotSeats>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  const { organization, token, version } = env.response;

  try {
    const response = await fetch(
      `https://api.github.com/orgs/${organization}/copilot/billing/seats`,
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
      return formatResponseError(organization, response);
    }

    const data = await response.json();
    return {
      status: "OK",
      response: data as CopilotSeats,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};