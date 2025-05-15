import {
  formatResponseError,
  unknownResponseError,
} from "@/features/common/response-error";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { ensureGitHubEnvConfig } from "./env-service";
import { CopilotSeatsData, SeatAssignment } from "@/features/common/models";
import { cosmosClient, cosmosConfiguration } from "./cosmos-db-service";
import { format } from "date-fns";
import { SqlQuerySpec } from "@azure/cosmos";
import { stringIsNullOrEmpty } from "../utils/helpers";

export interface IFilter {
  date?: Date;
  enterprise: string;
  organization: string;
  team: string;
  page: number;
}

export const getCopilotSeats = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatsData>> => {
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
      return getCopilotSeatsFromDatabase(filter);
    }
    return getCopilotSeatsFromApi(filter);
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getDataFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatsData[]>> => {
  try {
    const client = cosmosClient();
    const database = client.database("platform-engineering");
    const container = database.container("seats_history");

    let date = "";
    const maxDays = 365 * 2; // maximum 2 years of data

    if (filter.date) {
      date = format(filter.date, "yyyy-MM-dd");
    } else {
      const today = Date.now();
      date = format(today, "yyyy-MM-dd");
    }

    let querySpec: SqlQuerySpec = {
      query: `SELECT * FROM c WHERE c.date = @date`,
      parameters: [{ name: "@date", value: date }],
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
    if (filter.page) {
      querySpec.query += ` AND c.page = @page`;
      querySpec.parameters?.push({ name: "@page", value: filter.page });
    }

    let { resources } = await container.items
      .query<CopilotSeatsData>(querySpec, {
        maxItemCount: maxDays,
      })
      .fetchAll();

    // Garantee backwards compatibility with document that don't have the page property
    // Check if the resources array is empty, remove the page query and try again
    if (resources.length === 0 && querySpec.query.includes("c.page")) {
      querySpec.query = querySpec.query.replace(/ AND c.page = @page/, "");
      querySpec.parameters = querySpec.parameters?.filter(
        (param) => param.name !== "@page"
      );
      resources = (
        await container.items
          .query<CopilotSeatsData>(querySpec, {
            maxItemCount: maxDays,
          })
          .fetchAll()
      ).resources;
    }

    return {
      status: "OK",
      response: resources,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getCopilotSeatsFromDatabase = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatsData>> => {
  try {
    const data = await getDataFromDatabase(filter);

    if (data.status !== "OK" || !data.response) {
      return {
        status: "ERROR",
        errors: [{ message: "No data found" }]
      };
    }
    
    const seatsData = aggregateSeatsData(data.response);

    return {
      status: "OK",
      response: seatsData as CopilotSeatsData,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getDataFromApi = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatsData[]>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  let { token, version } = env.response;
  
  try {
    if (filter.enterprise) { 
      let enterpriseSeats: CopilotSeatsData[] = [];
      let pageCount = 1;
      let url = `https://api.github.com/enterprises/${filter.enterprise}/copilot/billing/seats?per_page=100`;

      do {
        const enterpriseResponse = await fetch(url, {
          cache: "no-store",
          headers: {
            Accept: `application/vnd.github+json`,
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": version,
          },
        });

        if (!enterpriseResponse.ok) {
          return formatResponseError(filter.enterprise, enterpriseResponse);
        }

        const enterpriseData = await enterpriseResponse.json();
        const enterpriseSeat: CopilotSeatsData = {
          enterprise: filter.enterprise,
          seats: enterpriseData.seats,
          total_seats: enterpriseData.total_seats,
          total_active_seats: 0,
          page: pageCount,
          has_next_page: false,
          last_update: null,
          date: "",
          id: "",
          organization: null,
        };

        const linkHeader = enterpriseResponse.headers.get("Link");
        url = getNextUrlFromLinkHeader(linkHeader) || "";
        enterpriseSeat.has_next_page = !stringIsNullOrEmpty(url);
        enterpriseSeats.push(enterpriseSeat);
        pageCount++
      } while (!stringIsNullOrEmpty(url));

      // Calculate total active seats for each page as the count of all active seats across all pages
      const allActiveSeatsCount = enterpriseSeats
        .flatMap((s) => s.seats)
        .filter((seat) => {
          if (!seat.last_activity_at) return false;
          const lastActivityDate = new Date(seat.last_activity_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastActivityDate >= thirtyDaysAgo;
        }).length;

      enterpriseSeats.forEach((seatPage) => {
        seatPage.total_active_seats = allActiveSeatsCount;
      });

      return {
        status: "OK",
        response: enterpriseSeats
      };
    }
    
    let organizationSeats: CopilotSeatsData[] = [];
    let pageCount = 1;
    let url = `https://api.github.com/orgs/${filter.organization}/copilot/billing/seats?per_page=100`;
    do {
      const organizationResponse = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: `application/vnd.github+json`,
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": version,
        },
      });

      if (!organizationResponse.ok) {
        return formatResponseError(filter.organization, organizationResponse);
      }

      const organizationData = await organizationResponse.json();
      const organizationSeat : CopilotSeatsData = {
        organization: filter.organization,
        seats: organizationData.seats,
        total_seats: organizationData.total_seats,
        total_active_seats: 0,
        page: pageCount,
        has_next_page: false,
        last_update: null,
        date: "",
        id: "",
        enterprise: null
      }; 

      const linkHeader = organizationResponse.headers.get("Link");
      url = getNextUrlFromLinkHeader(linkHeader) || "";
      organizationSeat.has_next_page = !stringIsNullOrEmpty(url);
      organizationSeats.push(organizationSeat);
      pageCount++
    } while (!stringIsNullOrEmpty(url));

    // Calculate total active seats for each page as the count of all active seats across all pages
    const allActiveSeatsCount = organizationSeats
      .flatMap((s) => s.seats)
      .filter((seat) => {
        if (!seat.last_activity_at) return false;
        const lastActivityDate = new Date(seat.last_activity_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActivityDate >= thirtyDaysAgo;
      }).length;

    organizationSeats.forEach((seatPage) => {
      seatPage.total_active_seats = allActiveSeatsCount;
    });

    return {
      status: "OK",
      response: organizationSeats,
    };
    
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getCopilotSeatsFromApi = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatsData>> => {  
  try {
    const data = await getDataFromApi(filter);

    if (data.status !== "OK" || !data.response) {
      return {
        status: "ERROR",
        errors: [{ message: "No data found" }]
      };
    }
    
    const seatsData = aggregateSeatsData(data.response);

    return {
      status: "OK",
      response: seatsData as CopilotSeatsData,
    };
    
  } catch (e) {
    return unknownResponseError(e);
  }
};

export const getCopilotSeatsManagement = async (
  filter: IFilter
): Promise<ServerActionResponse<CopilotSeatsData>> => {
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
      const data = await getCopilotSeatsFromDatabase(filter);

      if (data.status !== "OK" || !data.response) {
        return {
          status: "OK",
          response: {} as CopilotSeatsData
        };
      }

      const seatsData = data.response;
      return {
        status: "OK",
        response: seatsData as CopilotSeatsData,
      };
    }  
    
    const data = await getCopilotSeatsFromApi(filter);
    
    if (data.status !== "OK" || !data.response) {
      return {
        status: "OK",
        response: {} as CopilotSeatsData
      };
    }
    
    const seatsData = data.response;

    return {
      status: "OK",
      response: seatsData as CopilotSeatsData,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};

const getNextUrlFromLinkHeader = (linkHeader: string | null): string | null => {
  if (!linkHeader) return null;

  const links = linkHeader.split(',');
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match && match[2] === 'next') {
      return match[1];
    }
  }
  return null;
}

const aggregateSeatsData = (data: CopilotSeatsData[]): CopilotSeatsData => {
  let seats: SeatAssignment[] = [];

  if (data.length === 0) {
    return { total_seats: 0, total_active_seats: 0, seats: seats } as CopilotSeatsData;
  }

  // Garantee backwards compatibility with document without the total_active_seats property
  if (data[0].total_active_seats === null || data[0].total_active_seats === undefined) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    data[0].total_active_seats = data[0].seats.filter(seat => {
      if (!seat.last_activity_at) return false;
      const lastActivityDate = new Date(seat.last_activity_at);
      return lastActivityDate >= thirtyDaysAgo;
    }).length;
  }

  if (data.length === 1) {
    return data[0];
  }

  const allSeats = data.flatMap(seatData => seatData.seats);
  const uniqueSeatsMap = new Map<string, SeatAssignment>();
  allSeats.forEach(seat => {
    if (!uniqueSeatsMap.has(seat.assignee.login)) {
      uniqueSeatsMap.set(seat.assignee.login, seat);
    }
  });

  seats = Array.from(uniqueSeatsMap.values());

  const aggregatedData: CopilotSeatsData = {
    enterprise: data[0].enterprise,
    organization: data[0].organization,
    total_seats: data[0].total_seats,
    total_active_seats: data[0].total_active_seats,
    page: data[0].page,
    has_next_page: false,
    last_update: data[0].last_update,
    date: data[0].date,
    id: data[0].id,
    seats: seats
  }

  return aggregatedData;
}
