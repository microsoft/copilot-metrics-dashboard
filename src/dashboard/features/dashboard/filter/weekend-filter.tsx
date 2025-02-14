"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { dashboardStore, useDashboard } from "../dashboard-state";

export function WeekendFilter() {
  const dashboard = useDashboard();

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="hideWeekends"
        checked={dashboard.hideWeekends}
        onCheckedChange={(checked) => dashboardStore.toggleWeekendFilter(checked as boolean)}
      />
      <Label htmlFor="hideWeekends" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Hide weekends
      </Label>
    </div>
  );
}