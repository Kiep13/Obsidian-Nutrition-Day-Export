import { TFile } from "obsidian";
import { describe, expect, it } from "vitest";
import { FoodParserService } from "./FoodParserService";

describe("FoodParserService", () => {
  const parserService = new FoodParserService();
  const dailyFile = new TFile("Diary/2026.07.18.md");

  it("parses linked and inline foods only inside the Nutrition section", () => {
    const markdown = `# Title

## Nutrition
#food [[Tvaroh odtučněný zelený (Pilos)|Творог]] 100g
#food Запеканка 150g 6.72sugar 2.01fiber 192.52sodium 309.10kcal 27.82prot 14.24fat 8.28satfat 15.63carbs

## Sport
#food [[Ignored]] 10g`;

    const result = parserService.parseNutritionSection(
      dailyFile,
      markdown,
      "## Nutrition",
    );

    expect(result.sectionFound).toBe(true);
    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toMatchObject({
      ok: true,
      entry: {
        kind: "linked",
        displayName: "Творог",
      },
    });
    expect(result.results[1]).toMatchObject({
      ok: true,
      entry: {
        kind: "inline",
        displayName: "Запеканка",
      },
    });
  });

  it("ignores food markers inside fenced code blocks", () => {
    const markdown = `## Nutrition
\`\`\`
#food [[Ignored]] 10g
\`\`\`
#food [[Used]] 20g`;

    const result = parserService.parseNutritionSection(
      dailyFile,
      markdown,
      "## Nutrition",
    );

    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({
      ok: true,
      entry: {
        kind: "linked",
        displayName: "Used",
      },
    });
  });

  it("supports the whole document and Nutrition subsections as sources", () => {
    const markdown = `# Title
#food [[Document food]] 10g

## Nutrition
### Breakfast
#food [[Breakfast food]] 20g
#### Details
#food [[Breakfast detail]] 30g
### Dinner
#food [[Dinner food]] 40g

## Sport
#food [[Sport food]] 50g`;

    const options = parserService.getFoodSourceOptions(
      markdown,
      "## Nutrition",
    );
    expect(options.map((option) => option.id)).toEqual([
      "document",
      "nutrition",
      "heading-5",
      "heading-7",
      "heading-9",
    ]);

    const wholeDocumentResult = parserService.parseFoodEntries(
      dailyFile,
      markdown,
      { kind: "document" },
      "## Nutrition",
    );
    expect(wholeDocumentResult.results).toHaveLength(5);

    const breakfastResult = parserService.parseFoodEntries(
      dailyFile,
      markdown,
      {
        kind: "heading",
        headingText: "### Breakfast",
        lineNumber: 5,
      },
      "## Nutrition",
    );
    expect(breakfastResult.results).toHaveLength(2);
    expect(breakfastResult.results[0]).toMatchObject({
      ok: true,
      entry: { displayName: "Breakfast food" },
    });
    expect(breakfastResult.results[1]).toMatchObject({
      ok: true,
      entry: { displayName: "Breakfast detail" },
    });
  });

  it("keeps multiple food entries from one line in order", () => {
    const markdown = `## Nutrition
7:45 #food [[First]] 10g and #food [[Second]] 1pc`;

    const result = parserService.parseNutritionSection(
      dailyFile,
      markdown,
      "## Nutrition",
    );

    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toMatchObject({
      ok: true,
      entry: { displayName: "First" },
    });
    expect(result.results[1]).toMatchObject({
      ok: true,
      entry: { displayName: "Second" },
    });
  });

  it("returns a structured error for an inline entry with missing nutrition fields", () => {
    const markdown = `## Nutrition
#food Запеканка 150g 309.10kcal 27.82prot`;

    const result = parserService.parseNutritionSection(
      dailyFile,
      markdown,
      "## Nutrition",
    );

    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toEqual({
      ok: false,
      error: {
        code: "incomplete_nutrition_line",
        productName: "Запеканка",
        reason: "Inline food must contain all nutrition fields exactly once.",
        sourcePath: "Diary/2026.07.18.md",
        lineNumber: 2,
        rawEntry: "#food Запеканка 150g 309.10kcal 27.82prot",
      },
    });
  });

  it("returns a structured error for an unknown unit token", () => {
    const markdown = `## Nutrition
#food [[Tvaroh]] 100oz`;

    const result = parserService.parseNutritionSection(
      dailyFile,
      markdown,
      "## Nutrition",
    );

    expect(result.results[0]).toEqual({
      ok: false,
      error: {
        code: "unknown_unit",
        productName: "Tvaroh",
        reason: 'Unknown unit "oz".',
        sourcePath: "Diary/2026.07.18.md",
        lineNumber: 2,
        rawEntry: "#food [[Tvaroh]] 100oz",
      },
    });
  });
});
