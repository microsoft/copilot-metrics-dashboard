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

class DashboardState {
  public filteredData: CopilotSeatsData = {} as CopilotSeatsData;

  private apiData: CopilotSeatsData = {} as CopilotSeatsData;

  public initData(
    data: CopilotSeatsData
  ): void {
    this.apiData = data;
    this.filteredData = data;
  }

}

export const dashboardStore = proxy(new DashboardState());

export const useDashboard = () => {
  return useSnapshot(dashboardStore, { sync: true }) as DashboardState;
};

export const DataProvider = ({
  children,
  copilotSeats
}: IProps) => {
  dashboardStore.initData(copilotSeats);
  return <>{children}</>;
};
