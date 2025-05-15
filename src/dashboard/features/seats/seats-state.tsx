"use client";

import { PropsWithChildren } from "react";
import { CopilotSeatsData } from "@/features/common/models";
import { proxy, useSnapshot } from "valtio";


interface IProps extends PropsWithChildren {
  copilotSeats: CopilotSeatsData;
}

export interface DropdownFilterItem {
  value: string;
  isSelected: boolean;
}

class SeatsState {
  public seatsData: CopilotSeatsData = {} as CopilotSeatsData;

  public initData(
    data: CopilotSeatsData
  ): void {
    this.seatsData = data;
  }

}

export const dashboardStore = proxy(new SeatsState());

export const useDashboard = () => {
  return useSnapshot(dashboardStore, { sync: true }) as SeatsState;
};

export const DataProvider = ({
  children,
  copilotSeats
}: IProps) => {
  dashboardStore.initData(copilotSeats);
  return <>{children}</>;
};
