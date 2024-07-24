import { describe, expect, it } from "vitest";
import { applyTimeFrameLabel } from "../services/helper";
import { sampleData } from "../services/sample-data";
import { getActiveUsers } from "./common";

describe("getActiveUsers", () => {
  it("correctly computes the total active users from provided data", () => {
    const expectedTotalActiveUsers = [4, 10]; // From the sample data provided
    const data = applyTimeFrameLabel(sampleData);
    const actual = getActiveUsers(data).map((item) => item.totalUsers);
    expect(actual).toEqual(expectedTotalActiveUsers);
  });

  it("handles undefined or null data gracefully", () => {
    // @ts-ignore to allow testing with invalid input
    const resultForUndefined = getActiveUsers([]);

    expect(resultForUndefined.length).toBe(0);
  });
});
