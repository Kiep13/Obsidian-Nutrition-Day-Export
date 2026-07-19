import type { NutritionMetricKey, OutputUnitFormat, UnitKey } from "./types";

export const PLUGIN_NAME = "Nutrition Day Export";
export const DEFAULT_NUTRIENTS_FOLDER = "_nutrients";
export const DEFAULT_NUTRITION_HEADING = "## Nutrition";
export const DEFAULT_DECIMAL_PLACES = 2;
export const DEFAULT_OUTPUT_UNIT_FORMAT: OutputUnitFormat = "metric";
export const DATE_FILE_PATTERN = /^\d{4}\.\d{2}\.\d{2}$/;

export const NUTRITION_METRIC_KEYS: NutritionMetricKey[] = [
  "kcal",
  "prot",
  "fat",
  "satfat",
  "carbs",
  "sugar",
  "fiber",
  "sodium",
];

export const REQUIRED_NUTRIENT_FIELDS = {
  calories: "kcal",
  protein: "prot",
  fats: "fat",
  saturated_fats: "satfat",
  carbs: "carbs",
  sugar: "sugar",
  fiber: "fiber",
  sodium: "sodium",
} as const;

export const UNIT_ALIASES: Record<string, UnitKey> = {
  ["g"]: "g",
  ["ml"]: "ml",
  ["pc"]: "pc",
  ["г"]: "g",
  ["мл"]: "ml",
  ["шт"]: "pc",
};

export const OUTPUT_UNIT_LABELS: Record<
  OutputUnitFormat,
  Record<UnitKey, string>
> = {
  metric: {
    ["g"]: "г",
    ["ml"]: "мл",
    ["pc"]: "шт",
  },
  source: {
    ["g"]: "g",
    ["ml"]: "ml",
    ["pc"]: "pc",
  },
};
