// Minimal runtime stand-in for the types-only `obsidian` package. Used only in
// tests, wired up via the `obsidian` alias in vitest.config.ts. It mirrors the
// real getAllTags: merge inline `cache.tags` with frontmatter `tags` (array or
// comma-separated string) and return `#`-prefixed tags, or null when empty.
interface MinimalCache {
  tags?: { tag: string }[];
  frontmatter?: { tags?: unknown };
}

export function getAllTags(cache: MinimalCache): string[] | null {
  const tags: string[] = [];
  for (const t of cache.tags ?? []) {
    tags.push(t.tag);
  }
  const fm = cache.frontmatter?.tags;
  if (Array.isArray(fm)) {
    for (const t of fm) tags.push('#' + t);
  } else if (typeof fm === 'string') {
    for (const t of fm.split(',')) tags.push('#' + t.trim());
  }
  return tags.length > 0 ? tags : null;
}
