import { NUTRITION_METRIC_KEYS, UNIT_ALIASES } from "../constants";
import type { TFile } from "obsidian";
import type {
  AmountValue,
  InlineFoodEntry,
  NutritionMetrics,
  ParseResult,
  SourceReference,
  StructuredError,
} from "../types";
import { parseWikilink } from "../utils/markdownUtils";

const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const FOOD_MARKER_PATTERN = /#food\b/gi;
const AMOUNT_TOKEN_PATTERN = /^((?:\d+(?:[.,]\d+)?|\.\d+))(g|ml|pc|г|мл|шт)$/i;
const NUTRIENT_TOKEN_PATTERN =
  /^((?:\d+(?:[.,]\d+)?|\.\d+))(kcal|prot|fat|satfat|carbs|sugar|fiber|sodium)$/i;

type AmountParseResult =
  { ok: true; amount: AmountValue } | { ok: false; error: StructuredError };

type MetricsParseResult =
  | { ok: true; metrics: NutritionMetrics }
  | { ok: false; error: StructuredError };

export class FoodParserService {
  public parseNutritionSection(
    dailyFile: TFile,
    markdown: string,
    headingText: string,
  ): { results: ParseResult[]; sectionFound: boolean } {
    const lines = markdown.split(/\r?\n/);
    const normalizedHeading = headingText.trim();
    const headingMatch = normalizedHeading.match(HEADING_PATTERN);
    const targetHeadingText =
      headingMatch?.[2]?.trim() ??
      normalizedHeading.replace(/^#+\s*/, "").trim();
    const targetHeadingLevel = headingMatch?.[1]?.length ?? 2;

    let insideTargetSection = false;
    let sectionFound = false;
    let insideFence = false;
    const results: ParseResult[] = [];

    for (const [lineIndex, sourceLine] of lines.entries()) {
      const trimmedLine = sourceLine.trim();

      if (trimmedLine.startsWith("```") || trimmedLine.startsWith("~~~")) {
        if (insideTargetSection) {
          insideFence = !insideFence;
        }
        continue;
      }

      const currentHeadingMatch = trimmedLine.match(HEADING_PATTERN);
      if (currentHeadingMatch && !insideFence) {
        const currentHeadingHashes = currentHeadingMatch[1];
        const currentHeadingLabel = currentHeadingMatch[2];
        if (!currentHeadingHashes || !currentHeadingLabel) {
          continue;
        }

        const currentHeadingLevel = currentHeadingHashes.length;
        const currentHeadingText = currentHeadingLabel.trim();

        if (!insideTargetSection) {
          if (
            currentHeadingLevel === targetHeadingLevel &&
            currentHeadingText === targetHeadingText
          ) {
            insideTargetSection = true;
            sectionFound = true;
          }
          continue;
        }

        if (currentHeadingLevel <= targetHeadingLevel) {
          break;
        }
      }

      if (!insideTargetSection || insideFence) {
        continue;
      }

      const markerMatches = Array.from(
        sourceLine.matchAll(FOOD_MARKER_PATTERN),
      );
      if (markerMatches.length === 0) {
        continue;
      }

      for (const [markerIndex, markerMatch] of markerMatches.entries()) {
        const startIndex = markerMatch.index ?? 0;
        const nextMatch = markerMatches[markerIndex + 1];
        const endIndex = nextMatch?.index ?? sourceLine.length;
        const rawEntry = sourceLine.slice(startIndex, endIndex).trim();
        const source: SourceReference = {
          file: dailyFile,
          lineNumber: lineIndex + 1,
          rawLine: sourceLine,
          rawEntry,
        };
        results.push(this.parseRawEntry(source));
      }
    }

    return { results, sectionFound };
  }

  private parseRawEntry(source: SourceReference): ParseResult {
    const body = source.rawEntry.replace(/^#food\b/i, "").trim();
    if (!body) {
      return {
        ok: false,
        error: this.createError(
          "Food entry",
          "missing_amount",
          "Missing product body.",
          source,
        ),
      };
    }

    if (body.startsWith("[[")) {
      return this.parseLinkedEntry(body, source);
    }

    return this.parseInlineEntry(body, source);
  }

  private parseLinkedEntry(body: string, source: SourceReference): ParseResult {
    const wikilinkMatch = body.match(/^(\[\[[\s\S]+?\]\])\s*(.*)$/);
    if (!wikilinkMatch) {
      return {
        ok: false,
        error: this.createError(
          "Linked food",
          "missing_amount",
          "Could not parse the linked food entry.",
          source,
        ),
      };
    }

    const rawWikilink = wikilinkMatch[1];
    const trailingBody = wikilinkMatch[2] ?? "";
    if (!rawWikilink) {
      return {
        ok: false,
        error: this.createError(
          "Linked food",
          "missing_amount",
          "Could not parse the linked food entry.",
          source,
        ),
      };
    }

    const wikilink = parseWikilink(rawWikilink);
    if (!wikilink) {
      return {
        ok: false,
        error: this.createError(
          "Linked food",
          "missing_amount",
          "Could not parse the wikilink.",
          source,
        ),
      };
    }

    const amountToken = trailingBody.trim().split(/\s+/)[0] ?? "";
    const amount = this.parseAmountToken(
      amountToken,
      wikilink.displayName,
      source,
    );
    if (!amount.ok) {
      return amount;
    }

    return {
      ok: true,
      entry: {
        kind: "linked",
        displayName: wikilink.displayName,
        linkTarget: wikilink.linkTarget,
        amount: amount.amount,
        source,
      },
    };
  }

  private parseInlineEntry(body: string, source: SourceReference): ParseResult {
    const tokens = body.split(/\s+/).filter(Boolean);
    const amountTokenIndex = tokens.findIndex((token) =>
      AMOUNT_TOKEN_PATTERN.test(token),
    );
    const productName =
      amountTokenIndex > 0 ? tokens.slice(0, amountTokenIndex).join(" ") : body;

    if (amountTokenIndex < 1) {
      const unknownUnitToken = tokens.find((token) =>
        /^((?:\d+(?:[.,]\d+)?|\.\d+))[^\s\d]+$/i.test(token),
      );
      if (unknownUnitToken) {
        return {
          ok: false,
          error: this.createError(
            productName || "Inline food",
            "unknown_unit",
            `Unknown unit in token "${unknownUnitToken}".`,
            source,
          ),
        };
      }

      return {
        ok: false,
        error: this.createError(
          productName || "Inline food",
          "missing_amount",
          "Missing amount token.",
          source,
        ),
      };
    }

    const amountToken = tokens[amountTokenIndex];
    if (!amountToken) {
      return {
        ok: false,
        error: this.createError(
          productName || "Inline food",
          "missing_amount",
          "Missing amount token.",
          source,
        ),
      };
    }

    const amountResult = this.parseAmountToken(
      amountToken,
      productName,
      source,
    );
    if (!amountResult.ok) {
      return amountResult;
    }

    const nutrientTokens = tokens.slice(amountTokenIndex + 1);
    while (
      nutrientTokens.at(-1)?.toLowerCase() === "and" ||
      nutrientTokens.at(-1)?.toLowerCase() === "и"
    ) {
      nutrientTokens.pop();
    }
    const metricsResult = this.parseInlineMetrics(
      productName,
      nutrientTokens,
      source,
    );
    if (!metricsResult.ok) {
      return metricsResult;
    }

    const entry: InlineFoodEntry = {
      kind: "inline",
      displayName: productName,
      amount: amountResult.amount,
      metrics: metricsResult.metrics,
      source,
    };

    return {
      ok: true,
      entry,
    };
  }

  private parseAmountToken(
    rawToken: string,
    productName: string,
    source: SourceReference,
  ): AmountParseResult {
    const amountMatch = rawToken.match(AMOUNT_TOKEN_PATTERN);
    if (!amountMatch) {
      const unknownUnitMatch = rawToken.match(
        /^((?:\d+(?:[.,]\d+)?|\.\d+))([^\d\s]+)$/,
      );
      if (unknownUnitMatch?.[2]) {
        return {
          ok: false,
          error: this.createError(
            productName,
            "unknown_unit",
            `Unknown unit "${unknownUnitMatch[2]}".`,
            source,
          ),
        };
      }
      return {
        ok: false,
        error: this.createError(
          productName,
          "missing_amount",
          "Missing amount token.",
          source,
        ),
      };
    }

    const rawAmount = amountMatch[1];
    const rawUnit = amountMatch[2];
    if (!rawAmount || !rawUnit) {
      return {
        ok: false,
        error: this.createError(
          productName,
          "missing_amount",
          "Missing amount token.",
          source,
        ),
      };
    }

    const amountValue = Number.parseFloat(rawAmount.replace(",", "."));
    const normalizedUnit = UNIT_ALIASES[rawUnit.toLowerCase()];
    if (!normalizedUnit) {
      return {
        ok: false,
        error: this.createError(
          productName,
          "unknown_unit",
          `Unknown unit "${rawUnit}".`,
          source,
        ),
      };
    }

    return {
      ok: true,
      amount: {
        value: amountValue,
        unit: normalizedUnit,
        originalUnit: rawUnit,
      },
    };
  }

  private parseInlineMetrics(
    productName: string,
    nutrientTokens: string[],
    source: SourceReference,
  ): MetricsParseResult {
    if (nutrientTokens.length !== NUTRITION_METRIC_KEYS.length) {
      return {
        ok: false,
        error: this.createError(
          productName,
          "incomplete_nutrition_line",
          "Inline food must contain all nutrition fields exactly once.",
          source,
        ),
      };
    }

    const metricValues = {} as NutritionMetrics;
    const seenKeys = new Set<string>();

    for (const nutrientToken of nutrientTokens) {
      const nutrientMatch = nutrientToken.match(NUTRIENT_TOKEN_PATTERN);
      if (!nutrientMatch) {
        return {
          ok: false,
          error: this.createError(
            productName,
            "incomplete_nutrition_line",
            `Invalid nutrient token "${nutrientToken}".`,
            source,
          ),
        };
      }

      const rawMetricValue = nutrientMatch[1];
      const rawMetricKey = nutrientMatch[2];
      if (!rawMetricValue || !rawMetricKey) {
        return {
          ok: false,
          error: this.createError(
            productName,
            "incomplete_nutrition_line",
            `Invalid nutrient token "${nutrientToken}".`,
            source,
          ),
        };
      }

      const metricKey = rawMetricKey.toLowerCase();
      if (seenKeys.has(metricKey)) {
        return {
          ok: false,
          error: this.createError(
            productName,
            "incomplete_nutrition_line",
            `Duplicate nutrient field "${metricKey}".`,
            source,
          ),
        };
      }

      metricValues[metricKey as keyof NutritionMetrics] = Number.parseFloat(
        rawMetricValue.replace(",", "."),
      );
      seenKeys.add(metricKey);
    }

    for (const metricKey of NUTRITION_METRIC_KEYS) {
      if (!seenKeys.has(metricKey)) {
        return {
          ok: false,
          error: this.createError(
            productName,
            "incomplete_nutrition_line",
            `Missing nutrient field "${metricKey}".`,
            source,
          ),
        };
      }
    }

    return {
      ok: true,
      metrics: metricValues,
    };
  }

  private createError(
    productName: string,
    code: StructuredError["code"],
    reason: string,
    source: SourceReference,
  ): StructuredError {
    return {
      code,
      productName,
      reason,
      sourcePath: source.file.path,
      lineNumber: source.lineNumber,
      rawEntry: source.rawEntry,
    };
  }
}
