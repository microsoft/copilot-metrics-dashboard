"use client";
import { Card, CardContent } from "@/components/ui/card";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDashboard } from "../dashboard-state";
import { ChartHeader } from "./chart-header";
import {
  LineSuggestionsAndAcceptancesData,
  totalLinesSuggestedAndAccepted,
} from "./common";

export const TotalCodeLineSuggestionsAndAcceptances = () => {
  const { filteredData } = useDashboard();
  const data = totalLinesSuggestedAndAccepted(filteredData);
  return (
    <Card className="col-span-4">
      <ChartHeader
        title="Total code lines suggestions and acceptances"
        description="The total number of lines of code completions suggested by Copilot vs the total number of lines of code completions accepted by users."
      />
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-80">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDataOverflow
            />
            <XAxis
              dataKey={chartConfig.timeFrameDisplay.key}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Area
              dataKey={chartConfig.totalLinesSuggested.key}
              type="linear"
              fill="hsl(var(--chart-2))"
              stroke="hsl(var(--chart-2))"
            />
            <Area
              dataKey={chartConfig.totalLinesAccepted.key}
              type="linear"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
              stroke="hsl(var(--chart-1))"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const chartConfig: Record<
  DataKey,
  {
    label: string;
    key: DataKey;
  }
> = {
  ["timeFrameDisplay"]: {
    label: "Time frame display",
    key: "timeFrameDisplay",
  },
  ["totalLinesAccepted"]: {
    label: "Total lines accepted",
    key: "totalLinesAccepted",
  },
  ["totalLinesSuggested"]: {
    label: "Total lines suggested",
    key: "totalLinesSuggested",
  },
};

type DataKey = keyof LineSuggestionsAndAcceptancesData;
