# Nutrition Day Export Agent Context

## Plugin purpose

`nutrition-day-export` exports `#food` lines from a daily note into a normalized clipboard-friendly format without changing the source note.

## Architecture overview

- `src/main.ts` is the composition root.
- `src/ui/NutritionExportModal.ts` owns modal rendering, keyboard flow, clipboard interaction, and notices.
- `src/ui/SettingsTab.ts` owns settings UI.
- `src/services/*` own note lookup, parsing, nutrient resolution, calculation, and export assembly.
- `src/utils/*` hold pure helpers for dates, markdown parsing, and number formatting.

## Layer boundaries

- UI effects are allowed only in `src/ui/*` and `src/main.ts`.
- Business logic must stay in `src/services/*`.
- Expected failures must return structured results instead of throwing.
- Source notes and nutrient notes must remain read-only.

## Important commands

- `corepack pnpm install`
- `corepack pnpm typecheck`
- `corepack pnpm test`
- `corepack pnpm lint`
- `corepack pnpm build`

## Important files

- `manifest.json`
- `src/main.ts`
- `src/services/FoodParserService.ts`
- `src/services/NutrientCatalogService.ts`
- `src/services/NutritionCalculatorService.ts`
- `src/services/ExportService.ts`
- `src/ui/NutritionExportModal.ts`

## Constraints and conventions

- Use only relative imports.
- One-letter identifiers are forbidden.
- Keep the bundled runtime artifact at plugin-root `main.js`.
- Keep `README.md` in English.
- Do not modify source daily notes during export.

## Known risks or pitfalls

- Nutrient frontmatter keys are strict: `calories`, `protein`, `fats`, `saturated_fats`, `carbs`, `sugar`, `fiber`, `sodium`, `serving_size`.
- Empty numeric nutrient fields must be reported as structured errors, not silently coerced.
- Clipboard APIs may differ across runtimes, so keep fallback handling in the UI layer.
