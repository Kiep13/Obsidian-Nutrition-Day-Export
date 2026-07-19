import type { App, TFile } from "obsidian";
import type { StructuredError } from "../types";
import { isDailyNoteName, toDailyNoteFileName } from "../utils/dateUtils";

export interface DailyNoteLookupResult {
  file: TFile | null;
  selectedDate: string | null;
  error: StructuredError | null;
}

export class DailyNoteService {
  private readonly app: App;

  public constructor(app: App) {
    this.app = app;
  }

  public getInitialDate(): string {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile || !isDailyNoteName(activeFile.basename)) {
      return "";
    }

    return isDailyNoteName(activeFile.basename) ? activeFile.basename : "";
  }

  public resolveDailyNote(dateText: string): DailyNoteLookupResult {
    const trimmedDateText = dateText.trim();
    if (trimmedDateText) {
      const requestedFileName = toDailyNoteFileName(trimmedDateText);
      const matchingFile = this.app.vault
        .getMarkdownFiles()
        .find((markdownFile) => markdownFile.name === requestedFileName);

      if (!matchingFile) {
        return {
          file: null,
          selectedDate: trimmedDateText,
          error: {
            code: "daily_note_not_found",
            productName: trimmedDateText,
            reason: `Daily note ${requestedFileName} was not found.`,
            sourcePath: requestedFileName,
            lineNumber: 0,
            rawEntry: trimmedDateText,
          },
        };
      }

      return {
        file: matchingFile,
        selectedDate: trimmedDateText,
        error: null,
      };
    }

    const activeFile = this.app.workspace.getActiveFile();
    const activeFilePath = activeFile?.path ?? "";
    if (!activeFile || !isDailyNoteName(activeFile.basename)) {
      return {
        file: null,
        selectedDate: null,
        error: {
          code: "daily_note_not_found",
          productName: "Active note",
          reason:
            "There is no active daily note and no date override was provided.",
          sourcePath: activeFilePath,
          lineNumber: 0,
          rawEntry: "",
        },
      };
    }

    return {
      file: activeFile,
      selectedDate: isDailyNoteName(activeFile.basename)
        ? activeFile.basename
        : null,
      error: null,
    };
  }
}
