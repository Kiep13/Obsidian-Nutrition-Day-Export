export function splitFrontmatter(
  markdown: string,
): Record<string, string> | null {
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const frontmatterValues: Record<string, string> = {};
  const frontmatterBody = frontmatterMatch[1] ?? "";
  const frontmatterLines = frontmatterBody.split(/\r?\n/);

  for (const frontmatterLine of frontmatterLines) {
    const keyValueMatch = frontmatterLine.match(
      /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/,
    );
    if (!keyValueMatch) {
      continue;
    }

    const frontmatterKey = keyValueMatch[1];
    if (!frontmatterKey) {
      continue;
    }

    frontmatterValues[frontmatterKey] = normalizeYamlScalar(
      keyValueMatch[2] ?? "",
    );
  }

  return frontmatterValues;
}

export function normalizeYamlScalar(rawValue: string): string {
  const trimmedValue = rawValue.trim();
  const quotedMatch = trimmedValue.match(/^["'](.*)["']$/);
  return quotedMatch?.[1] ?? trimmedValue;
}

export function normalizeLookupText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Mark}+/gu, "")
    .replace(/\.md$/i, "")
    .trim()
    .toLowerCase();
}

export function parseWikilink(
  rawValue: string,
): { linkTarget: string; displayName: string } | null {
  const wikilinkMatch = rawValue.match(/^\[\[([\s\S]+?)\]\]$/);
  if (!wikilinkMatch) {
    return null;
  }

  const innerValue = wikilinkMatch[1];
  if (!innerValue) {
    return null;
  }
  const separatorIndex = innerValue.indexOf("|");
  if (separatorIndex >= 0) {
    const linkTarget = innerValue.slice(0, separatorIndex).trim();
    const displayName = innerValue.slice(separatorIndex + 1).trim();
    return {
      linkTarget,
      displayName: displayName || fallbackDisplayName(linkTarget),
    };
  }

  return {
    linkTarget: innerValue.trim(),
    displayName: fallbackDisplayName(innerValue),
  };
}

function fallbackDisplayName(linkTarget: string): string {
  const lastPathSegment = linkTarget.split("/").pop() ?? linkTarget;
  return lastPathSegment.replace(/\.md$/i, "").trim();
}
