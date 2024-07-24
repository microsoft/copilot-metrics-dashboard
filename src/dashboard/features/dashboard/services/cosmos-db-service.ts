import { ServerActionResponse } from "@/features/common/server-action-response";
import { CosmosClient } from "@azure/cosmos";
import { stringIsNullOrEmpty } from "../utils/helpers";

interface CosmosConfig {
  endpoint: string;
  key: string;
}

export const ensureCosmosEnvConfig = (): ServerActionResponse<CosmosConfig> => {
  const endpoint = process.env.AZURE_COSMOSDB_ENDPOINT;
  const key = process.env.AZURE_COSMOSDB_KEY;

  if (stringIsNullOrEmpty(endpoint)) {
    return {
      status: "ERROR",
      errors: [
        {
          message:
            "Missing required environment variable for CosmosDB endpoint",
        },
      ],
    };
  }

  if (stringIsNullOrEmpty(key)) {
    return {
      status: "ERROR",
      errors: [
        {
          message: "Missing required environment variable for CosmosDB key",
        },
      ],
    };
  }

  return {
    status: "OK",
    response: {
      endpoint,
      key,
    },
  };
};

export const cosmosClient = () => {
  const endpoint = process.env.AZURE_COSMOSDB_ENDPOINT;
  const key = process.env.AZURE_COSMOSDB_KEY;

  const response = ensureCosmosEnvConfig();
  if (response.status === "ERROR") {
    throw new Error(response.errors[0].message);
  }

  return new CosmosClient({ endpoint, key });
};

export const cosmosConfiguration = (): boolean => {
  const endpoint = process.env.AZURE_COSMOSDB_ENDPOINT;
  const key = process.env.AZURE_COSMOSDB_KEY;

  return (
    endpoint !== undefined &&
    endpoint.trim() !== "" &&
    key !== undefined &&
    key.trim() !== ""
  );
};
