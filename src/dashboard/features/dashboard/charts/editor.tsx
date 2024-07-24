"use client";
import { Card, CardContent } from "@/components/ui/card";

import { ListItems } from "./language";

import { Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDashboard } from "../dashboard-state";
import { ChartHeader } from "./chart-header";
import { computeEditorData } from "./common";

export const Editor = () => {
  const { filteredData } = useDashboard();
  const data = computeEditorData(filteredData);
  return (
    <Card className="col-span-4 md:col-span-2">
      <ChartHeader
        title="Editor"
        description="Percentage of active users per editor"
      />
      <CardContent>
        <div className="w-full h-full flex flex-col gap-4 ">
          <div>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  paddingAngle={1}
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  cornerRadius={5}
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
