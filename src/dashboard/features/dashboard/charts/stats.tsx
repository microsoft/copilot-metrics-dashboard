"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "../dashboard-state";
import { ChartHeader } from "./chart-header";
import {
  computeActiveUserAverage,
  computeAdoptionRate,
  computeCumulativeAcceptanceAverage,
} from "./common";
import StatsCard from "./stats-card";

export const Stats = () => {
  const { seatManagement, filteredData } = useDashboard();
  const acceptanceAverage = computeCumulativeAcceptanceAverage(filteredData);
  const averageActiveUsers = computeActiveUserAverage(filteredData);
  const adoptionRate = computeAdoptionRate(seatManagement);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 col-span-4">
      <StatsCard
        title="Acceptance average"
        description="Inline code acceptance average"
        value={acceptanceAverage.toFixed(2) + "%"}
      ></StatsCard>
      <StatsCard
        title="Active users"
        description="Average active users"
        value={averageActiveUsers.toFixed(0) + ""}
      ></StatsCard>
      <StatsCard
        title="Adoption rate"
        description="Copilot adoption rate by active users"
        value={adoptionRate.toFixed(0) + "%"}
      ></StatsCard>
      <Overview />
    </div>
  );
};

export const Overview = () => {
  const Item = ({ label, value }: { label: string; value: number }) => (
    <div className="flex-1 flex flex-row gap-2">
      <div className="text-xs flex-1 text-muted-foreground">{label}</div>
      <div className="text-xs ">{value}</div>
    </div>
  );

  const { seatManagement } = useDashboard();
  const { total, active_this_cycle, inactive_this_cycle } =
    seatManagement.seat_breakdown;

  return (
    <Card className="col-span-1">
      <ChartHeader
        title={"Seat information"}
        description={"Overview of GitHub Copilot seats"}
      />
      <CardContent className=" flex flex-col gap-2">
        <Item label="Total" value={total} />
        <Item label="Active" value={active_this_cycle} />
        <Item label="Inactive" value={inactive_this_cycle} />
      </CardContent>
    </Card>
  );
};
