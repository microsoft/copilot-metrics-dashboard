"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { dashboardStore, TimeFrame, useDashboard } from "../dashboard-state";

export const TimeFrameToggle = () => {
  const { timeFrame: selectedTimeFrame } = useDashboard();
  return (
    <Tabs defaultValue={selectedTimeFrame} className="">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          value="daily"
          className="gap-2 font-normal"
          onClick={() => {
            dashboardStore.onTimeFrameChange("daily");
          }}
        >
          Daily
        </TabsTrigger>
        <TabsTrigger
          value="weekly"
          className="gap-2 font-normal"
          onClick={() => {
            dashboardStore.onTimeFrameChange("weekly");
          }}
        >
          Weekly
        </TabsTrigger>
        <TabsTrigger
          value="monthly"
          className="gap-2 font-normal"
          onClick={() => {
            dashboardStore.onTimeFrameChange("monthly");
          }}
        >
          Monthly
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

interface IProps extends PropsWithChildren {}

interface TimeFrameState {
  selectedTimeFrame: TimeFrame;
  setSelectedTimeFrame: (timeFrame: TimeFrame) => void;
}

const TimeFrameContext = createContext<TimeFrameState | undefined>(undefined);

const TimeFrameProvider = ({ children }: IProps) => {
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<TimeFrame>("weekly");

  return (
    <TimeFrameContext.Provider
      value={{
        selectedTimeFrame,
        setSelectedTimeFrame,
      }}
    >
      {children}
    </TimeFrameContext.Provider>
  );
};

function useTimeFrame() {
  const context = useContext(TimeFrameContext);
  if (context === undefined) {
    throw new Error("useTimeFrame must be used within a CountProvider");
  }
  return context;
}

export { TimeFrameProvider, useTimeFrame };
