import { ServerActionResponse } from "@/features/common/server-action-response";

interface GitHubConfig {
  organization: string;
  enterprise: string;
  token: string;
  version: string;
  scope: string;
}

interface FeaturesConfig {
  dashboard: boolean;
  seats: boolean;
}

export const ensureGitHubEnvConfig = (): ServerActionResponse<GitHubConfig> => {
  const organization = process.env.GITHUB_ORGANIZATION;
  const enterprise = process.env.GITHUB_ENTERPRISE;
  const token = process.env.GITHUB_TOKEN;
  const version = process.env.GITHUB_API_VERSION;
  let scope = process.env.GITHUB_API_SCOPE;

  if (stringIsNullOrEmpty(organization)) {
    console.log("Missing required environment variable for organization");
    return {
      status: "ERROR",
      errors: [
        {
          message: "Missing required environment variable for organization",
        },
      ],
    };
  }

  if (stringIsNullOrEmpty(enterprise)) {
    return {
      status: "ERROR",
      errors: [
        {
          message:
            "Missing required environment variable for GitHub enterprise",
        },
      ],
    };
  }

  if (stringIsNullOrEmpty(token)) {
    return {
      status: "ERROR",
      errors: [
        {
          message: "Missing required environment variable for GitHub token",
        },
      ],
    };
  }

  if (stringIsNullOrEmpty(version)) {
    return {
      status: "ERROR",
      errors: [
        {
          message:
            "Missing required environment variable for GitHub API version",
        },
      ],
    };
  }

  if (validateScope(scope)) {
    return {
      status: "ERROR",
      errors: [
        {
          message:
            "Invalid GitHub API scope: " +
            scope +
            ". Value must be 'enterprise' or 'organization'",
        },
      ],
    };
  }

  if (stringIsNullOrEmpty(scope)) {
    scope = "organization";
  }

  return {
    status: "OK",
    response: {
      organization,
      enterprise,
      token,
      version,
      scope,
    },
  };
};

export const featuresEnvConfig = (): ServerActionResponse<FeaturesConfig> => {
  const enableDashboardFeature = process.env.ENABLE_DASHBOARD_FEATURE !== "false" ? true : false;
  const enableSeatsFeature = process.env.ENABLE_SEATS_FEATURE !== "false" ? true : false;
  return {
    status: "OK",
    response: {
      dashboard: enableDashboardFeature,
      seats: enableSeatsFeature,
    },
  };
};

export const stringIsNullOrEmpty = (str: string | null | undefined) => {
  return str === null || str === undefined || str === "";
};

export const validateScope = (str: string | null | undefined) => {
  return str !== "enterprise" && str !== "organization";
};
