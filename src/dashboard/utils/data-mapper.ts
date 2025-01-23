import { CopilotUsageOutput } from "@/features/common/models";

export const groupByTimeFrame = (
  groupedByTimeFrame: Record<string, CopilotUsageOutput[]>
) => {
  const updatedResponse: CopilotUsageOutput[] = [];

  Object.keys(groupedByTimeFrame).forEach((week) => {
    const aggregatedData: CopilotUsageOutput = {
      total_active_users: 0,
      total_engaged_users: 0,
      total_ide_engaged_users: 0,
      total_code_suggestions: 0,
      total_code_acceptances: 0,
      total_code_lines_suggested: 0,
      total_code_lines_accepted: 0,
      total_chat_engaged_users: 0,
      total_chats: 0,
      total_chat_insertion_events: 0,
      total_chat_copy_events: 0,
      day: "", // Decide how to handle this
      breakdown: [], // Decide how to handle this
      time_frame_month: "",
      time_frame_week: "",
      time_frame_display: week,
    };

    const timeFrameLength = groupedByTimeFrame[week].length;

    groupedByTimeFrame[week].forEach((item, index) => {
      aggregatedData.total_active_users += item.total_active_users;
      aggregatedData.total_engaged_users += item.total_engaged_users;
      aggregatedData.total_ide_engaged_users += item.total_ide_engaged_users;
      aggregatedData.total_code_suggestions += item.total_code_suggestions;
      aggregatedData.total_code_acceptances += item.total_code_acceptances;
      aggregatedData.total_code_lines_suggested += item.total_code_lines_suggested;
      aggregatedData.total_code_lines_accepted += item.total_code_lines_accepted;
      aggregatedData.total_chat_engaged_users += item.total_chat_engaged_users;
      aggregatedData.total_chats += item.total_chats;
      aggregatedData.total_chat_insertion_events += item.total_chat_insertion_events;
      aggregatedData.total_chat_copy_events += item.total_chat_copy_events;

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

    aggregatedData.total_engaged_users = average(
      aggregatedData.total_engaged_users
    );

    aggregatedData.total_chat_engaged_users = average(
      aggregatedData.total_chat_engaged_users
    );

    updatedResponse.push(aggregatedData);
  });

  return updatedResponse;
};
