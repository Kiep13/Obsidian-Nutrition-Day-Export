# Nutrition Day Export

Nutrition Day Export is an Obsidian plugin that reads `#food` entries from the `## Nutrition` section of a daily note and copies normalized nutrition lines to the clipboard.

## Purpose

The plugin is built for a daily-note food logging workflow where nutrition data lives either in linked `_nutrients` notes or directly inside inline `#food` strings.

## Features

- Uses the active daily note by default
- Lets you export another day using a native date picker or the `Today` button
- Reads only the configured nutrition section
- Ignores fenced code blocks
- Supports multiple `#food` entries on one line
- Supports linked foods and inline custom foods
- Resolves `g`, `ml`, `pc` and `г`, `мл`, `шт`
- Copies only successful product lines to the clipboard
- Shows structured per-product errors without changing the source note

## Installation

```bash
./install.sh /path/to/your/vault
```

Then enable **Nutrition Day Export** in Obsidian community plugins.

## Configuration

Open **Settings -> Community plugins -> Nutrition Day Export**.

Available settings:

- `Nutrients folder` - vault-relative folder containing nutrient notes. Default: `_nutrients`
- `Nutrition heading` - heading used as the section boundary. Default: `## Nutrition`
- `Output units` - `г/мл/шт` or `g/ml/pc`
- `Decimal places` - formatting precision for exported metrics. Default: `2`

## Development

Standard toolchain:

- `pnpm`
- `Node 22`
- `esbuild`
- `TypeScript`
- `ESLint`
- `Prettier`
- `Vitest`

Useful commands:

```bash
corepack pnpm install
corepack pnpm typecheck
corepack pnpm test
corepack pnpm lint
corepack pnpm build
```

## Testing

Run:

```bash
corepack pnpm test
corepack pnpm test:watch
```

The unit tests cover:

- nutrition-section parsing boundaries
- fenced code block exclusion
- multiple `#food` entries on one line
- linked and inline food parsing
- `g`, `ml`, and `pc` calculations
- structured expected errors for invalid nutrient data
