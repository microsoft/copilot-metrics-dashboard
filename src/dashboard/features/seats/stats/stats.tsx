"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "@/features/seats/seats-state";
import { CopilotSeatsData } from "@/features/common/models";
import StatsCard from "./stats-card";

interface TotalSeatsData {
  total_seats: number;
  total_active_seats: number;
  total_inactive_seats: number;
}

function totalSeats(filteredData: CopilotSeatsData): TotalSeatsData {
  let total_active_seats = 0;
  let total_inactive_seats = 0;
  filteredData?.seats.map((item) => {
    const lastActivityAt = new Date(item.last_activity_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - lastActivityAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (item.pending_cancellation_date && new Date(item.pending_cancellation_date) < currentDate || diffDays > 31) {
      total_inactive_seats += 1;
    } else {
      total_active_seats += 1;
    }
  });

  return {
    total_seats: total_active_seats + total_inactive_seats,
    total_active_seats: total_active_seats,
    total_inactive_seats: total_inactive_seats
  };
}

export const Stats = () => {
  const { filteredData } = useDashboard();
  const totalSeatsData = totalSeats(filteredData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 col-span-4">
      <StatsCard
        title="Total users"
        description="Total assigned seats"
        value={totalSeatsData.total_seats.toString()}
      ></StatsCard>
      <StatsCard
        title="Active users"
        description="Total active users"
        value={totalSeatsData.total_active_seats.toString()}
      ></StatsCard>
      <StatsCard
        title="Inactive users"
        description="Total inactive users"
        value={totalSeatsData.total_inactive_seats.toString()}
      ></StatsCard>
      <StatsCard
        title="Adoption rate"
        description="Adoption rate by total active users"
        value={totalSeatsData.total_seats > 0 ? ((totalSeatsData.total_active_seats / totalSeatsData.total_seats) * 100 ).toFixed(0) + "%" : "0%"}
      ></StatsCard>
    </div>
  );
};


