const azureEnvVars = [
  "GITHUB_ENTERPRISE",
  "GITHUB_TOKEN",
  "GITHUB_ORGANIZATION",
  "AZURE_COSMOSDB_ENDPOINT",
  "AZURE_COSMOSDB_KEY",
] as const;

type RequiredServerEnvKeys = (typeof azureEnvVars)[number];

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<RequiredServerEnvKeys, string> {}
  }
}

export {};
