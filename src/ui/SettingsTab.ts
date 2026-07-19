import { PluginSettingTab, Setting } from "obsidian";
import type { App } from "obsidian";
import {
  DEFAULT_DECIMAL_PLACES,
  DEFAULT_NUTRIENTS_FOLDER,
  DEFAULT_NUTRITION_HEADING,
} from "../constants";
import type NutritionDayExportPlugin from "../main";

export class SettingsTab extends PluginSettingTab {
  private readonly plugin: NutritionDayExportPlugin;

  public constructor(app: App, plugin: NutritionDayExportPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  public override display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Nutrients folder")
      .setDesc("Vault-relative folder with nutrient notes.")
      .addText((textComponent) => {
        textComponent
          .setPlaceholder(DEFAULT_NUTRIENTS_FOLDER)
          .setValue(this.plugin.settings.nutrientsFolder)
          .onChange(async (value) => {
            this.plugin.settings.nutrientsFolder =
              value.trim() || DEFAULT_NUTRIENTS_FOLDER;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Nutrition heading")
      .setDesc("Exact heading used as the export section boundary.")
      .addText((textComponent) => {
        textComponent
          .setPlaceholder(DEFAULT_NUTRITION_HEADING)
          .setValue(this.plugin.settings.nutritionHeading)
          .onChange(async (value) => {
            this.plugin.settings.nutritionHeading =
              value.trim() || DEFAULT_NUTRITION_HEADING;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Output units")
      .setDesc("Choose Cyrillic or Latin unit labels for exported lines.")
      .addDropdown((dropdownComponent) => {
        dropdownComponent
          .addOption("metric", "г/мл/шт")
          .addOption("source", "g/ml/pc")
          .setValue(this.plugin.settings.outputUnitFormat)
          .onChange(async (value) => {
            this.plugin.settings.outputUnitFormat =
              value === "source" ? "source" : "metric";
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Decimal places")
      .setDesc("Number of decimal places used in exported metrics.")
      .addText((textComponent) => {
        textComponent
          .setPlaceholder(String(DEFAULT_DECIMAL_PLACES))
          .setValue(String(this.plugin.settings.decimalPlaces))
          .onChange(async (value) => {
            const parsedValue = Number.parseInt(value, 10);
            this.plugin.settings.decimalPlaces =
              Number.isFinite(parsedValue) && parsedValue >= 0
                ? parsedValue
                : DEFAULT_DECIMAL_PLACES;
            await this.plugin.saveSettings();
          });
      });
  }
}
