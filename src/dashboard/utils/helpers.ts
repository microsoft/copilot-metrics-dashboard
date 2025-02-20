import { featuresEnvConfig } from "@/services/env-service";
import { format, startOfWeek, parse, isValid } from "date-fns";
import { CopilotMetrics, CopilotUsageOutput, Breakdown } from "@/features/common/models";

export const applyTimeFrameLabel = (
  data: CopilotMetrics[]
): CopilotUsageOutput[] => {
  // Sort data by 'day'
  const sortedData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dataWithTimeFrame: CopilotUsageOutput[] = [];

  sortedData.forEach((item) => {
    // Convert 'day' to a Date object and find the start of its week
    const date = new Date(item.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });

    // Create a unique week identifier
    const weekIdentifier = format(weekStart, "MMM dd");
    const monthIdentifier = format(date, "MMM yy");

    // Create a breakdown array
    let breakdowns: Breakdown[] = [];

    (item.copilot_ide_code_completions.editors|| []).forEach((editor) => {
      editor.models.forEach((model) => {
        model.languages!.forEach((language) => {
          breakdowns.push({
            editor: editor.name.toLowerCase(),
            model: model.name,
            language: language.name,
            suggestions_count: language.total_code_suggestions,
            acceptances_count: language.total_code_acceptances,
            lines_suggested: language.total_code_lines_suggested,
            lines_accepted: language.total_code_lines_accepted,
            active_users: language.total_engaged_users
          } as Breakdown);
        });
      });
    });

    const output: CopilotUsageOutput = {
      ...item,
      total_active_users: item.total_active_users,
      total_engaged_users: item.total_engaged_users,
      total_ide_engaged_users: item.copilot_ide_code_completions.total_engaged_users,
      total_code_suggestions: (item.copilot_ide_code_completions.editors|| []).reduce((acc, editor) => acc + editor.models.reduce((modelAcc, model) => modelAcc + model.languages!.reduce((langAcc, lang) => langAcc + (lang.total_code_suggestions || 0), 0), 0), 0),
      total_code_acceptances: (item.copilot_ide_code_completions.editors|| []).reduce((acc, editor) => acc + editor.models.reduce((modelAcc, model) => modelAcc + model.languages!.reduce((langAcc, lang) => langAcc + (lang.total_code_acceptances || 0), 0), 0), 0),
      total_code_lines_suggested: (item.copilot_ide_code_completions.editors|| []).reduce((acc, editor) => acc + editor.models.reduce((modelAcc, model) => modelAcc + model.languages!.reduce((langAcc, lang) => langAcc + (lang.total_code_lines_suggested || 0), 0), 0), 0),
      total_code_lines_accepted: (item.copilot_ide_code_completions.editors|| []).reduce((acc, editor) => acc + editor.models.reduce((modelAcc, model) => modelAcc + model.languages!.reduce((langAcc, lang) => langAcc + (lang.total_code_lines_accepted || 0), 0), 0), 0),
      total_chat_engaged_users: item.copilot_ide_chat.total_engaged_users,
      total_chats:  (item.copilot_ide_chat.editors || []).reduce((acc, editor) => acc + (editor.models.reduce((modelAcc, model) => modelAcc + (model.total_chats || 0), 0)), 0),
      total_chat_insertion_events:  (item.copilot_ide_chat.editors || []).reduce((acc, editor) => acc + (editor.models.reduce((modelAcc, model) => modelAcc + (model.total_chat_insertion_events || 0), 0)), 0),
      total_chat_copy_events:  (item.copilot_ide_chat.editors || []).reduce((acc, editor) => acc + (editor.models.reduce((modelAcc, model) => modelAcc + (model.total_chat_copy_events || 0), 0)), 0),
      day: item.date,
      breakdown: breakdowns,
      time_frame_week: weekIdentifier,
      time_frame_month: monthIdentifier,
      time_frame_display: weekIdentifier,
    };
    dataWithTimeFrame.push(output);
  });

  return dataWithTimeFrame;
};

export const getFeatures = () => {
  const features = featuresEnvConfig();
  if (features.status !== "OK") {
    return {
      dashboard: true,
      seats: true
    }
  }
  return features.response;
}

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const parseDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
};

export const stringIsNullOrEmpty = (str: string | null | undefined) => {
  return str === null || str === undefined || str === "";
};

export const getNextUrlFromLinkHeader = (linkHeader: string | null): string | null => {
  if (!linkHeader) return null;

  const links = linkHeader.split(',');
  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match && match[2] === 'next') {
      return match[1];
    }
  }
  return null;
}