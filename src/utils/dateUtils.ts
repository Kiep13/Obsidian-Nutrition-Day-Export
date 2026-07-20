import { DATE_FILE_PATTERN } from "../constants";

export function isDailyNoteName(fileBasename: string): boolean {
  return DATE_FILE_PATTERN.test(fileBasename.trim());
}

export function toDailyNoteFileName(dateText: string): string {
  return `${dateText.trim()}.md`;
}

export function toDateInputValue(dateText: string): string {
  const trimmedDateText = dateText.trim();
  if (!DATE_FILE_PATTERN.test(trimmedDateText)) {
    return "";
  }

  return trimmedDateText.replace(/\./g, "-");
}

export function fromDateInputValue(dateInputValue: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInputValue)) {
    return "";
  }

  return dateInputValue.replace(/-/g, ".");
}

export function getTodayDailyNoteName(currentDate: Date = new Date()): string {
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${currentDate.getFullYear()}.${month}.${day}`;
}
