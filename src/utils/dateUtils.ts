import { DATE_FILE_PATTERN } from "../constants";

export function isDailyNoteName(fileBasename: string): boolean {
  return DATE_FILE_PATTERN.test(fileBasename.trim());
}

export function toDailyNoteFileName(dateText: string): string {
  return `${dateText.trim()}.md`;
}
