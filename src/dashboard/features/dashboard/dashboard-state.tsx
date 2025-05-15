"use client";

import { PropsWithChildren } from "react";
import { Breakdown, CopilotUsageOutput } from "@/features/common/models";
import { formatDate } from "@/utils/helpers";

import { proxy, useSnapshot } from "valtio";

import { groupByTimeFrame } from "@/utils/data-mapper";
import { CopilotSeatsData } from "../common/models";

interface IProps extends PropsWithChildren {
  copilotUsages: CopilotUsageOutput[];
  seatsData: CopilotSeatsData;
}

export interface DropdownFilterItem {
  value: string;
  isSelected: boolean;
}

export type TimeFrame = "daily" | "weekly" | "monthly";

class DashboardState {
  public filteredData: CopilotUsageOutput[] = [];
  public languages: DropdownFilterItem[] = [];
  public editors: DropdownFilterItem[] = [];
  public timeFrame: TimeFrame = "weekly";
  public hideWeekends: boolean = false;

  public seatsData: CopilotSeatsData = {} as CopilotSeatsData;

  private apiData: CopilotUsageOutput[] = [];

  public initData(
    data: CopilotUsageOutput[],
    seatsData: CopilotSeatsData
  ): void {
    this.apiData = [...data];
    this.filteredData = [...data];
    this.onTimeFrameChange(this.timeFrame);
    this.languages = this.extractUniqueLanguages();
    this.editors = this.extractUniqueEditors();
    this.seatsData = seatsData;
  }

  public filterLanguage(language: string): void {
    const item = this.languages.find((l) => l.value === language);
    if (item) {
      item.isSelected = !item.isSelected;
      this.applyFilters();
    }
  }

  public filterEditor(editor: string): void {
    const item = this.editors.find((l) => l.value === editor);
    if (item) {
      item.isSelected = !item.isSelected;
      this.applyFilters();
    }
  }

  public toggleWeekendFilter(hide: boolean): void {
    this.hideWeekends = hide;
    this.applyFilters();
  }

  public resetAllFilters(): void {
    this.languages.forEach((item) => (item.isSelected = false));
    this.editors.forEach((item) => (item.isSelected = false));
    this.hideWeekends = false;
    this.applyFilters();
  }

  public onTimeFrameChange(timeFrame: TimeFrame): void {
    this.timeFrame = timeFrame;
    this.applyFilters();
  }

  private applyFilters(): void {
    const data = this.aggregatedDataByTimeFrame(this.hideWeekends);

    const selectedLanguages = this.languages.filter((item) => item.isSelected);
    const selectedEditors = this.editors.filter((item) => item.isSelected);

    if (selectedLanguages.length !== 0) {
      data.forEach((item) => {
        const filtered = item.breakdown.filter((breakdown: Breakdown) =>
          selectedLanguages.some(
            (selectedLanguage) => selectedLanguage.value === breakdown.language
          )
        );
        item.breakdown = filtered;
      });
    }

    if (selectedEditors.length !== 0) {
      data.forEach((item) => {
        const filtered = item.breakdown.filter((breakdown: Breakdown) =>
          selectedEditors.some((editor) => editor.value === breakdown.editor)
        );
        item.breakdown = filtered;
      });
    }

    this.filteredData = data.filter((item) => item.breakdown.length > 0);
  }

  private extractUniqueLanguages(): DropdownFilterItem[] {
    const languages: DropdownFilterItem[] = [];

    this.apiData.forEach((item) => {
      item.breakdown.forEach((breakdown) => {
        const index = languages.findIndex(
          (language) => language.value === breakdown.language
        );

        if (index === -1) {
          languages.push({ value: breakdown.language, isSelected: false });
        }
      });
    });

    return languages;
  }

  private extractUniqueEditors(): DropdownFilterItem[] {
    const editors: DropdownFilterItem[] = [];
    this.apiData.forEach((item) => {
      item.breakdown.forEach((breakdown) => {
        const index = editors.findIndex(
          (editor) => editor.value === breakdown.editor
        );

        if (index === -1) {
          editors.push({ value: breakdown.editor, isSelected: false });
        }
      });
    });

    return editors;
  }

  private aggregatedDataByTimeFrame(hideWeekends: boolean) {
    let items = JSON.parse(JSON.stringify(this.apiData)) as CopilotUsageOutput[];
    
    if (hideWeekends) {
      items = items.filter(item => {
        const date = new Date(item.day);
        const day = date.getDay();
        return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
      });
    }

    if (this.timeFrame === "daily") {
      items.forEach((item) => {
        item.time_frame_display = formatDate(item.day);
      });
      return items;
    }

    const groupedByTimeFrame = items.reduce((acc, item) => {
      const timeFrameLabel =
        this.timeFrame === "weekly"
          ? item.time_frame_week
          : item.time_frame_month;

      if (!acc[timeFrameLabel]) {
        acc[timeFrameLabel] = [];
      }

      acc[timeFrameLabel].push(item);

      return acc;
    }, {} as Record<string, CopilotUsageOutput[]>);

    return groupByTimeFrame(groupedByTimeFrame);
  }
}

export const dashboardStore = proxy(new DashboardState());

export const useDashboard = () => {
  return useSnapshot(dashboardStore, { sync: true }) as DashboardState;
};

export const DataProvider = ({
  children,
  copilotUsages,
  seatsData,
}: IProps) => {
  dashboardStore.initData(copilotUsages, seatsData);
  return <>{children}</>;
};
