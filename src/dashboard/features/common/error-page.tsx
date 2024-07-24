import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const ErrorPage = ({ error }: { error: string }) => {
  return (
    <div className="mx-auto w-full max-w-xl container py-2 h-full flex-1 items-center justify-center flex">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );
};
