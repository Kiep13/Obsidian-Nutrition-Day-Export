import { Modal, Notice, setIcon } from "obsidian";
import type { App } from "obsidian";
import type {
  ExportReport,
  NutritionDayExportSettings,
  StructuredError,
} from "../types";
import { PLUGIN_NAME } from "../constants";
import type { ExportService } from "../services/ExportService";

export class NutritionExportModal extends Modal {
  private readonly exportService: ExportService;
  private readonly getSettings: () => NutritionDayExportSettings;
  private dateText: string;
  private report: ExportReport | null = null;
  private topError: StructuredError | null = null;
  private dateInputEl!: HTMLInputElement;
  private statsEl!: HTMLDivElement;
  private statusEl!: HTMLDivElement;
  private previewEl!: HTMLTextAreaElement;
  private errorsEl!: HTMLDivElement;
  private copyButtonEl!: HTMLButtonElement;

  public constructor(
    app: App,
    exportService: ExportService,
    getSettings: () => NutritionDayExportSettings,
  ) {
    super(app);
    this.exportService = exportService;
    this.getSettings = getSettings;
    this.dateText = exportService.getInitialDate();
  }

  public override onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("nutrition-day-export-modal");

    const titleRowEl = contentEl.createDiv({
      cls: "nutrition-day-export-title-row",
    });
    const titleIconEl = titleRowEl.createDiv({
      cls: "nutrition-day-export-title-icon",
    });
    setIcon(titleIconEl, "clipboard-copy");
    titleRowEl.createEl("h2", { text: PLUGIN_NAME });

    const controlsEl = contentEl.createDiv({
      cls: "nutrition-day-export-controls",
    });
    const dateFieldEl = controlsEl.createDiv({
      cls: "nutrition-day-export-field",
    });
    dateFieldEl.createEl("label", { text: "Date override (YYYY.MM.DD)" });
    this.dateInputEl = dateFieldEl.createEl("input", {
      attr: {
        type: "text",
        placeholder: "YYYY.MM.DD",
      },
    });
    this.dateInputEl.value = this.dateText;
    this.dateInputEl.addEventListener("input", (inputEvent) => {
      this.dateText = (inputEvent.target as HTMLInputElement).value;
    });
    this.dateInputEl.addEventListener("keydown", (keyboardEvent) => {
      if (keyboardEvent.key === "Enter") {
        void this.refresh();
      }
    });

    const buttonRowEl = controlsEl.createDiv({
      cls: "nutrition-day-export-button-row",
    });
    this.copyButtonEl = buttonRowEl.createEl("button", {
      cls: "mod-cta",
      text: "Copy",
    });
    this.copyButtonEl.addEventListener("click", () => {
      void this.copyPreview();
    });

    const refreshButtonEl = buttonRowEl.createEl("button", {
      text: "Refresh",
    });
    refreshButtonEl.addEventListener("click", () => {
      void this.refresh();
    });

    this.statsEl = contentEl.createDiv({ cls: "nutrition-day-export-stats" });
    this.statusEl = contentEl.createDiv({ cls: "nutrition-day-export-status" });
    this.previewEl = contentEl.createEl("textarea", {
      cls: "nutrition-day-export-preview",
      attr: { readonly: "true" },
    });
    this.previewEl.rows = 12;
    this.errorsEl = contentEl.createDiv({ cls: "nutrition-day-export-errors" });

    void this.refresh();
  }

  public override onClose(): void {
    this.contentEl.empty();
  }

  private async refresh(): Promise<void> {
    this.topError = null;
    this.report = null;
    this.render();

    const result = await this.exportService.buildReport(
      this.dateText,
      this.getSettings(),
    );
    if ("note" in result) {
      this.report = result;
    } else {
      this.topError = result;
    }

    this.render();
  }

  private render(): void {
    if (this.topError) {
      this.statsEl.setText(
        "Products found: 0 | Successfully exported: 0 | Errors: 1",
      );
      this.statusEl.setText(this.topError.reason);
      this.previewEl.value = "";
      this.copyButtonEl.disabled = true;
      this.renderErrors([this.topError]);
      return;
    }

    if (!this.report) {
      this.statsEl.setText("Loading...");
      this.statusEl.setText("");
      this.previewEl.value = "";
      this.copyButtonEl.disabled = true;
      this.renderErrors([]);
      return;
    }

    this.statsEl.setText(
      `Products found: ${this.report.entriesFound} | Successfully exported: ${this.report.successCount} | Errors: ${this.report.errorCount}`,
    );
    this.statusEl.setText(
      this.report.selectedDate
        ? `Selected date: ${this.report.selectedDate}`
        : `Active note: ${this.report.note.basename}`,
    );
    this.previewEl.value =
      this.report.previewText || this.report.infoMessage || "";
    this.copyButtonEl.disabled = this.report.successCount === 0;
    this.renderErrors(this.report.errors);
  }

  private renderErrors(errors: StructuredError[]): void {
    this.errorsEl.empty();
    if (errors.length === 0) {
      return;
    }

    this.errorsEl.createEl("h3", { text: "Errors" });
    for (const error of errors) {
      const errorCardEl = this.errorsEl.createDiv({
        cls: "nutrition-day-export-error-card",
      });
      errorCardEl.createDiv({
        cls: "nutrition-day-export-error-title",
        text: error.productName,
      });
      errorCardEl.createDiv({ text: error.reason });
      errorCardEl.createDiv({
        text: `Source: ${error.sourcePath}, line ${error.lineNumber}`,
      });
    }
  }

  private async copyPreview(): Promise<void> {
    if (!this.report || !this.report.clipboardText) {
      return;
    }

    const clipboard = window.navigator.clipboard;
    if (clipboard?.writeText) {
      await clipboard.writeText(this.report.clipboardText);
    } else {
      const textareaEl = document.createElement("textarea");
      textareaEl.value = this.report.clipboardText;
      document.body.appendChild(textareaEl);
      textareaEl.select();
      document.execCommand("copy");
      document.body.removeChild(textareaEl);
    }

    new Notice("Nutrition export copied.");
  }
}
