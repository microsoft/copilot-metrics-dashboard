import { describe, expect, it } from "vitest";
import { applyTimeFrameLabel } from "@/utils/helpers";
import { sampleData } from "@/services/sample-data";
import { computeAcceptanceAverage } from "./common";

describe("computeAcceptanceAverage", () => {
  it("correctly computes the acceptance average for provided data", () => {
    const expectedResults = [
      {
        acceptanceRate: 50.46, // (376 / 745) * 100 from sample data
        acceptanceLinesRate: 51.63, // (405 / 785) * 100 from sample data
        timeFrameDisplay: "Jun 24",
      },
    ];

    const results = computeAcceptanceAverage(applyTimeFrameLabel(sampleData));
    expect(results).toEqual(expectedResults);
  });

  it("handles empty input data gracefully", () => {
    const results = computeAcceptanceAverage([]);
    expect(results).toEqual([]);
  });

  it("handles data with zero suggested lines", () => {
    const modifiedData = [
      {
        ...sampleData[0],
        copilot_ide_code_completions: {
          ...sampleData[0].copilot_ide_code_completions,
          editors: sampleData[0].copilot_ide_code_completions.editors.map((editor) => ({
            ...editor,
            models: editor.models.map((model) => ({
              ...model,
              languages: model.languages!.map((lang) => ({
                ...lang,
                total_code_suggestions: 0,
                total_code_lines_suggested: 0,
              })),
            })),
          })),
        },
      },
    ];
    const expectedResults = [
      {
        acceptanceRate: 0, // No lines suggested, so acceptance rate should be 0
        acceptanceLinesRate: 0,
        timeFrameDisplay: "Jun 24",
      },
    ];

    const results = computeAcceptanceAverage(applyTimeFrameLabel(modifiedData));
    expect(results).toEqual(expectedResults);
  });
});
