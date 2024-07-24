"use client";
import { Card, CardContent } from "@/components/ui/card";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useDashboard } from "../dashboard-state";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { AcceptanceRateData, computeAcceptanceAverage } from "./common";

import { ChartHeader } from "./chart-header";

export const AcceptanceRate = () => {
  const { filteredData } = useDashboard();
  const data = computeAcceptanceAverage(filteredData);

  return (
    <Card className="col-span-4">
      <ChartHeader
        title="Acceptance rate"
        description=" The ratio of accepted lines to the total lines suggested by GitHub
          Copilot"
      />

      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <AreaChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={chartConfig.timeFrameDisplay.key}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              dataKey={chartConfig.acceptanceRate.key}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDataOverflow
              domain={[0, 100]}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Area
              dataKey={chartConfig.acceptanceRate.key}
              type="linear"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.4}
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
  ["acceptanceRate"]: {
    label: "Acceptance rate (%) ",
    key: "acceptanceRate",
  },

  ["timeFrameDisplay"]: {
    label: "Time frame display",
    key: "timeFrameDisplay",
  },
};

type DataKey = keyof AcceptanceRateData;
