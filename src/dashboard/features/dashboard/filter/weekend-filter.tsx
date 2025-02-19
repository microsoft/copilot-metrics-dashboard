"use client";

import { CalendarMinus, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardStore, useDashboard } from "../dashboard-state";

export function WeekendFilter() {
  const dashboard = useDashboard();

  return (
    <Button
      variant={dashboard.hideWeekends ? "default" : "outline"}
      size="default"
      onClick={() => dashboardStore.toggleWeekendFilter(!dashboard.hideWeekends)}
      className="justify-start text-left font-normal"
    >
      {dashboard.hideWeekends ? (
        <CalendarPlus className="mr-2 h-4 w-4" />
      ) : (
        <CalendarMinus className="mr-2 h-4 w-4" />
      )}
      {dashboard.hideWeekends ? "Show weekends" : "Hide weekends"}
    </Button>
  );
}