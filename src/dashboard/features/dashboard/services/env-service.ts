import { ServerActionResponse } from "@/features/common/server-action-response";

interface GitHubConfig {
  organization: string;
  enterprise: string;
  token: string;
  version: string;
}

export const ensureGitHubEnvConfig = (): ServerActionResponse<GitHubConfig> => {
  const organization = process.env.GITHUB_ORGANIZATION;
  const enterprise = process.env.GITHUB_ENTERPRISE;
  const token = process.env.GITHUB_TOKEN;
  const version = process.env.GITHUB_API_VERSION;

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

  return {
    status: "OK",
    response: {
      organization,
      enterprise,
      token,
      version,
    },
  };
};

export const stringIsNullOrEmpty = (str: string | null | undefined) => {
  return str === null || str === undefined || str === "";
};
