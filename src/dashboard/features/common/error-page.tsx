import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

// New interface to support structured error information
interface ErrorDetails {
  status?: "ERROR" | "NOT_FOUND" | "UNAUTHORIZED";
  title?: string;
  message: string;
}

export const ErrorPage = ({ error }: { error: string | ErrorDetails }) => {
  // Convert string errors to ErrorDetails format
  const errorDetails: ErrorDetails = typeof error === "string" 
    ? { message: error }
    : error;

  // Set defaults if not provided
  const title = errorDetails.title || getDefaultTitle(errorDetails.status);
  
  return (
    <div className="mx-auto w-full max-w-2xl container py-6 h-full flex-1 items-center justify-center flex">
      <Card className="w-full">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">{title}</CardTitle>
          </div>
          <CardDescription>
          {errorDetails.message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {errorDetails.message}
        </CardContent>
        
        <CardFooter className="flex justify-center border-t p-4">
          <Button onClick={() => window.location.reload()} className="flex gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Helper functions to provide default values based on error type
function getDefaultTitle(status?: "ERROR" | "NOT_FOUND" | "UNAUTHORIZED"): string {
  switch (status) {
    case "NOT_FOUND":
      return "Resource Not Found";
    case "UNAUTHORIZED":
      return "Authentication Required";
    case "ERROR":
    default:
      return "An Error Occurred";
  }
}
