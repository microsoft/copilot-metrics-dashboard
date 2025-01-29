import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChartHeaderProps {
  title: string;
  description: string;
  tip?: string;
}

export const ChartHeader = (props: ChartHeaderProps) => {
  return (
    <CardHeader className="border-b mb-3 pb-3">
      <div className="flex items-center gap-2">
        <CardTitle>{props.title}</CardTitle>
        {props.tip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground p-3 max-w-[320px] border">
                <p className="text-sm leading-relaxed">{props.tip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <CardDescription className="text-xs">{props.description}</CardDescription>
    </CardHeader>
  );
};
