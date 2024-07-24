import { CopilotUsageOutput } from "../services/copilot-metrics-service";

export const groupByTimeFrame = (
  groupedByTimeFrame: Record<string, CopilotUsageOutput[]>
) => {
  const updatedResponse: CopilotUsageOutput[] = [];

  Object.keys(groupedByTimeFrame).forEach((week) => {
    const aggregatedData: CopilotUsageOutput = {
      total_suggestions_count: 0,
      total_acceptances_count: 0,
      total_lines_suggested: 0,
      total_lines_accepted: 0,
      total_active_users: 0,
      total_chat_acceptances: 0,
      total_chat_turns: 0,
      total_active_chat_users: 0,
      day: "", // Decide how to handle this
      breakdown: [], // Decide how to handle this
      time_frame_month: "",
      time_frame_week: "",
      time_frame_display: week,
    };

    const timeFrameLength = groupedByTimeFrame[week].length;

    groupedByTimeFrame[week].forEach((item, index) => {
      aggregatedData.total_suggestions_count += item.total_suggestions_count;
      aggregatedData.total_acceptances_count += item.total_acceptances_count;
      aggregatedData.total_lines_suggested += item.total_lines_suggested;
      aggregatedData.total_lines_accepted += item.total_lines_accepted;
      aggregatedData.total_active_users += item.total_active_users;
      aggregatedData.total_chat_acceptances += item.total_chat_acceptances;
      aggregatedData.total_chat_turns += item.total_chat_turns;
      aggregatedData.total_active_chat_users += item.total_active_chat_users;

      item.breakdown.forEach((breakdownItem) => {
        const existingIndex = aggregatedData.breakdown.findIndex(
          (bd) =>
            bd.language === breakdownItem.language &&
            bd.editor === breakdownItem.editor
        );

        if (existingIndex >= 0) {
          aggregatedData.breakdown[existingIndex].suggestions_count +=
            breakdownItem.suggestions_count;
          aggregatedData.breakdown[existingIndex].acceptances_count +=
            breakdownItem.acceptances_count;
          aggregatedData.breakdown[existingIndex].lines_suggested +=
            breakdownItem.lines_suggested;
          aggregatedData.breakdown[existingIndex].lines_accepted +=
            breakdownItem.lines_accepted;
          aggregatedData.breakdown[existingIndex].active_users +=
            breakdownItem.active_users;
        } else {
          aggregatedData.breakdown.push(breakdownItem);
        }
      });
    });

    const average = (value: number) => Math.ceil(value / timeFrameLength);

    aggregatedData.total_active_users = average(
      aggregatedData.total_active_users
    );

    aggregatedData.total_active_chat_users = average(
      aggregatedData.total_active_chat_users
    );

    updatedResponse.push(aggregatedData);
  });

  return updatedResponse;
};
