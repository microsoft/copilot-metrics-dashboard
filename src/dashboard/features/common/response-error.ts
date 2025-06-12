import { ServerActionValidationError } from "./server-action-response";

export const formatResponseError = (
  entity: string,
  response: Response
): ServerActionValidationError => {
  let message = `HTTP ${response.status}: ${response.statusText}`;
  let status: "ERROR" | "NOT_FOUND" | "UNAUTHORIZED" = "ERROR";

  // Handle common HTTP status codes with specific messages
  switch (response.status) {
    case 400:
      message = `Bad request when accessing ${entity}. Please check your input parameters.`;
      break;
    case 401:
      status = "UNAUTHORIZED";
      message = "Authorization failed. Please verify that you have provided the correct token and ensure it has not expired.";
      break;
    case 403:
      message = `Access forbidden. You don't have permission to access ${entity}.`;
      break;
    case 404:
      status = "NOT_FOUND";
      message = `Entity with the name ${entity} was not found.`;
      break;
    case 422:
      message = `Your organization has disabled Copilot Metrics API access for ${entity}. Enable it in GitHub settings to access this data.`;
      break;
    case 429:
      message = `Too many requests. Rate limit exceeded for ${entity}. Please try again later.`;
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = `Server error (${response.status}) occurred while accessing ${entity}. Please try again later.`;
      break;
  }

  return {
    status,
    errors: [{ message }],
  };
};

export const unknownResponseError = (
  e: unknown
): ServerActionValidationError => {
  console.error(e);
  
  let errorMessage = "An unknown error occurred while fetching data.";
  
  // Try to extract more detailed error information
  if (e instanceof Error) {
    errorMessage = `Error: ${e.message}`;
    
    // Add stack trace in development environment
    if (process.env.NODE_ENV === "development" && e.stack) {
      console.error(e.stack);
    }
  } else if (typeof e === "string") {
    errorMessage = `Error: ${e}`;
  } else if (e && typeof e === "object") {
    try {
      const errorString = JSON.stringify(e, null, 2);
      errorMessage = `Error: ${errorString.substring(0, 100)}${errorString.length > 100 ? '...' : ''}`;
    } catch (jsonError) {
      errorMessage = "Error: Could not stringify error object";
    }
  }
  
  return {
    status: "ERROR",
    errors: [{ message: errorMessage }],
  };
};
