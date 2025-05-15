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
  const { seatsData, filteredData } = useDashboard();
  const acceptanceAverage = computeCumulativeAcceptanceAverage(filteredData);
  const averageActiveUsers = computeActiveUserAverage(filteredData);
  const adoptionRate = computeAdoptionRate(seatsData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 col-span-4">
      <StatsCard
        title="Acceptance average"
        tip="Acceptance average is the average of the acceptance rate for lines of code and chat suggestions, including chat insertion and copy events."
        description="Combined acceptance average"
        value={acceptanceAverage.toFixed(0) + "%"}
      ></StatsCard>
      <StatsCard
        title="Active users"
        tip="The average number of Copilot users with daily activity belonging to any Copilot feature, for the given period. Includes passive activity such as receiving a code suggestion, as well as engagement activity such as accepting a code suggestion or prompting chat. Does not include authentication events."
        description="Average of daily active users"
        value={averageActiveUsers.toFixed(0) + ""}
      ></StatsCard>
      <StatsCard
        title="Adoption rate"
        tip="The adoption rate is the percentage of active seats compared to the total seats."
        description="Adoption rate by active seats"
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

  const { seatsData } = useDashboard();
  let total_seats = 0;
  let total_active_seats = 0;

  if (seatsData && typeof seatsData.total_seats === "number" && typeof seatsData.total_active_seats === "number") {
    total_seats = seatsData.total_seats;
    total_active_seats = seatsData.total_active_seats;
  }

  return (
    <Card className="col-span-1">
      <ChartHeader
        title={"Seat information"}
        description={"Overview of GitHub Copilot seats"}
        tip={"The active seats are the seats where last activity is within the last 30 days. The inactive seats are the seats where last activity is null or older than 30 days."}
      />
      <CardContent className=" flex flex-col gap-2">
        <Item label="Total seats" value={total_seats} />
        <Item label="Active seats" value={total_active_seats} />
        <Item label="Inactive seats" value={total_seats - total_active_seats} />
      </CardContent>
    </Card>
  );
};
