import { Breakdown, CopilotUsageOutput } from "@/features/common/models";
import { PieChartData } from "./language";

export interface AcceptanceRateData {
  acceptanceRate: number;
  acceptanceLinesRate: number;
  timeFrameDisplay: string;
}

export const computeAcceptanceAverage = (
  filteredData: CopilotUsageOutput[]
): AcceptanceRateData[] => {
  const rates = filteredData.map((item) => {
    let cumulatedAccepted = 0;
    let cumulatedSuggested = 0;

    item.breakdown.forEach((breakdown: Breakdown) => {
      const { acceptances_count, suggestions_count } = breakdown;
      cumulatedAccepted += acceptances_count;
      cumulatedSuggested += suggestions_count;
    });

    const acceptanceAverage =
    cumulatedSuggested !== 0
      ? (cumulatedAccepted / cumulatedSuggested) * 100
      : 0;
    
    let cumulatedLinesAccepted = 0;
    let cumulatedLinesSuggested = 0;

    item.breakdown.forEach((breakdown: Breakdown) => {
      const { lines_accepted, lines_suggested } = breakdown;
      cumulatedLinesAccepted += lines_accepted;
      cumulatedLinesSuggested += lines_suggested;
    });

    const acceptanceLinesAverage =
      cumulatedLinesSuggested !== 0
        ? (cumulatedLinesAccepted / cumulatedLinesSuggested) * 100
        : 0;

    return {
      acceptanceRate: parseFloat(acceptanceAverage.toFixed(2)),
      acceptanceLinesRate: parseFloat(acceptanceLinesAverage.toFixed(2)),
      timeFrameDisplay: item.time_frame_display,
    };
  });

  return rates;
};

export interface ActiveUserData {
  totalUsers: number;
  totalChatUsers: number;
  timeFrameDisplay: string;
}

export function getActiveUsers(
  filteredData: CopilotUsageOutput[]
): ActiveUserData[] {
  const rates = filteredData.map((item) => {
    return {
      totalUsers: item.total_active_users,
      totalChatUsers: item.total_chat_engaged_users,
      timeFrameDisplay: item.time_frame_display,
    };
  });

  return rates;
}

export const computeEditorData = (
  filteredData: CopilotUsageOutput[]
): Array<PieChartData> => {
  const editorMap = new Map<string, PieChartData>();

  // Aggregate data
  filteredData.forEach(({ breakdown }) => {
    breakdown.forEach(({ editor, active_users }) => {
      const editorData = editorMap.get(editor) || {
        id: editor,
        name: editor,
        value: 0,
        fill: "",
      };
      editorData.value += active_users;
      editorMap.set(editor, editorData);
    });
  });

  // Convert Map to Array and calculate percentages
  let totalSum = 0;
  const editors = Array.from(editorMap.values()).map((editor) => {
    totalSum += editor.value;
    return editor;
  });

  // Calculate percentage values
  editors.forEach((editor) => {
    editor.value = Number(((editor.value / totalSum) * 100).toFixed(2));
  });

  // Sort by value
  editors.sort((a, b) => b.value - a.value);

  // Assign colors
  editors.forEach((editor, index) => {
    editor.fill = `hsl(var(--chart-${index < 4 ? index + 1 : 5}))`;
  });

  return editors;
};

export const computeLanguageData = (
  filteredData: CopilotUsageOutput[]
): Array<PieChartData> => {
  const languageMap = new Map<string, PieChartData>();

  // Aggregate data
  filteredData.forEach(({ breakdown }) => {
    breakdown.forEach(({ language, active_users }) => {
      const languageData = languageMap.get(language) || {
        id: language,
        name: language,
        value: 0,
        fill: "",
      };
      languageData.value += active_users;
      languageMap.set(language, languageData);
    });
  });

  // Convert Map to Array and calculate percentages
  let totalSum = 0;
  const languages = Array.from(languageMap.values()).map((language) => {
    totalSum += language.value;
    return language;
  });

  // Calculate percentage values
  languages.forEach((language) => {
    language.value = Number(((language.value / totalSum) * 100).toFixed(2));
  });

  // Sort by value
  languages.sort((a, b) => b.value - a.value);

  // Assign colors
  languages.forEach((language, index) => {
    language.fill = `hsl(var(--chart-${index < 4 ? index + 1 : 5}))`;
  });

  return languages;
};

export const computeActiveUserAverage = (
  filteredData: CopilotUsageOutput[]
) => {
  const activeUsersSum: number = filteredData.reduce(
    (sum: number, item: { total_active_users: number }) =>
      sum + item.total_active_users,
    0
  );

  const averageActiveUsers = activeUsersSum / filteredData.length;
  return averageActiveUsers;
};

export const computeAdoptionRate = (seatManagement: any) => {
  const adoptionRate =
    (seatManagement.seat_breakdown.active_this_cycle /
      seatManagement.seat_breakdown.total) *
    100;
  return adoptionRate;
};

export const computeCumulativeAcceptanceAverage = (
  filteredData: CopilotUsageOutput[]
) => {
  const acceptanceAverages = computeAcceptanceAverage(filteredData);

  const acceptanceChatAverages = computeChatAcceptanceAverage(filteredData);

  const totalAcceptanceRate = acceptanceAverages.reduce(
    (sum, rate) => sum + rate.acceptanceLinesRate,
    0
  );

  const totalChatAcceptanceRate = acceptanceChatAverages.reduce(
    (sum, rate) => sum + rate.acceptanceChatRate,
    0
  ); 

  const comulativeAcceptanceRate = totalAcceptanceRate / acceptanceAverages.length;
  const comulativeChatAcceptanceRate = totalChatAcceptanceRate / acceptanceChatAverages.length;

  return (comulativeAcceptanceRate + comulativeChatAcceptanceRate) / 2;
};

export interface LineSuggestionsAndAcceptancesData {
  totalLinesAccepted: number;
  totalLinesSuggested: number;
  timeFrameDisplay: string;
}

export function totalLinesSuggestedAndAccepted(
  filteredData: CopilotUsageOutput[]
): LineSuggestionsAndAcceptancesData[] {
  const codeLineSuggestionsAndAcceptances = filteredData.map((item) => {
    let total_lines_accepted = 0;
    let total_lines_suggested = 0;

    item.breakdown.forEach((breakdown) => {
      total_lines_accepted += breakdown.lines_accepted;
      total_lines_suggested += breakdown.lines_suggested;
    });

    return {
      totalLinesAccepted: total_lines_accepted,
      totalLinesSuggested: total_lines_suggested,
      timeFrameDisplay: item.time_frame_display,
    };
  });

  return codeLineSuggestionsAndAcceptances;
}

export interface SuggestionAcceptanceData {
  totalAcceptancesCount: number;
  totalSuggestionsCount: number;
  timeFrameDisplay: string;
}

export function totalSuggestionsAndAcceptances(
  filteredData: CopilotUsageOutput[]
): SuggestionAcceptanceData[] {
  const rates = filteredData.map((item) => {
    let totalAcceptancesCount = 0;
    let totalSuggestionsCount = 0;

    item.breakdown.forEach((breakdown) => {
      totalAcceptancesCount += breakdown.acceptances_count;
      totalSuggestionsCount += breakdown.suggestions_count;
    });

    return {
      totalAcceptancesCount,
      totalSuggestionsCount,
      timeFrameDisplay: item.time_frame_display,
    };
  });

  return rates;
}

export interface ChatAcceptanceRateData {
  acceptanceChatRate: number;
  timeFrameDisplay: string;
}

export const computeChatAcceptanceAverage = (
  filteredData: CopilotUsageOutput[]
): ChatAcceptanceRateData[] => {
  const rates = filteredData.map((item) => {

    const acceptanceRate =
    item.total_chats !== 0
      ? ((item.total_chat_insertion_events + item.total_chat_copy_events) / item.total_chats) * 100
      : 0;

    return {
      acceptanceChatRate: parseFloat(acceptanceRate.toFixed(2)),
      timeFrameDisplay: item.time_frame_display
    };
  });

  return rates;
};

export interface ChatAcceptanceData {
  totalChats: number;
  totalChatInsertionEvents: number;
  totalChatCopyEvents: number;
  timeFrameDisplay: string;
}

export function totalChatsAndAcceptances(
  filteredData: CopilotUsageOutput[]
): ChatAcceptanceData[] {
  const rates = filteredData.map((item) => {

    return {
      totalChats: item.total_chats,
      totalChatInsertionEvents: item.total_chat_insertion_events,
      totalChatCopyEvents: item.total_chat_copy_events,
      timeFrameDisplay: item.time_frame_display
    };
  });

  return rates;
}
