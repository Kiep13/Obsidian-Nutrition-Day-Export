import { describe, expect, it } from "vitest";
import {
  fromDateInputValue,
  getTodayDailyNoteName,
  toDateInputValue,
} from "./dateUtils";

describe("date input helpers", () => {
  it("converts between native input and daily note date formats", () => {
    expect(toDateInputValue("2026.07.19")).toBe("2026-07-19");
    expect(fromDateInputValue("2026-07-19")).toBe("2026.07.19");
  });

  it("returns an empty value for incomplete input", () => {
    expect(toDateInputValue("2026-07")).toBe("");
    expect(fromDateInputValue("2026-07")).toBe("");
  });

  it("formats today's local date for a daily note", () => {
    expect(getTodayDailyNoteName(new Date(2026, 6, 19))).toBe("2026.07.19");
  });
});
