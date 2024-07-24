"use client";
import { Card, CardContent } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";
import { useDashboard } from "../dashboard-state";
import { ChartHeader } from "./chart-header";
import { computeLanguageData } from "./common";

export interface PieChartData {
  id: string;
  name: string;
  value: number;
  fill: string;
}

export const Language = () => {
  const { filteredData } = useDashboard();
  const data = computeLanguageData(filteredData);

  return (
    <Card className="col-span-4 md:col-span-2">
      <ChartHeader
        title="Language"
        description="Percentage of active users per language"
      />
      <CardContent>
        <div className="w-full h-full flex flex-col gap-4 ">
          <div className="">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  paddingAngle={1}
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cornerRadius={5}
                  innerRadius={40}
                />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="flex flex-col gap-4 text-sm flex-wrap">
            <ListItems items={data} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const chartConfig = {} satisfies ChartConfig;

export function ListItems(props: { items: PieChartData[] }) {
  const { items } = props;

  return (
    <ScrollArea className="h-72 rounded-md">
      <div className="gap-1 flex flex-col">
        {items.map((item) => (
          <div
            className="px-4 py-2 text-sm flex items-center border-b border-muted"
            key={item.name}
          >
            <span className="flex-1">{item.name}</span>
            <span className="p-1 px-2 border bg-primary-foreground rounded-full text-xs">
              {item.value} %
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
