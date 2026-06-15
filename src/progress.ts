import { CachedMetadata, getAllTags } from 'obsidian';

export interface Progress {
  completed: number;
  total: number;
  remaining: number;
}

/**
 * Counts checkbox tasks in a file's cache.
 *
 * Obsidian stores a task's checked status in `listItem.task` as a single
 * character: `' '` is incomplete and any other character (`x`, `X`, `/`, `-`,
 * ...) is complete. `undefined` means the list item is not a task at all.
 */
export function computeProgress(cache: CachedMetadata): Progress {
  const tasks = (cache.listItems ?? []).filter((i) => i.task !== undefined);
  const completed = tasks.filter((i) => i.task !== ' ').length;
  const total = tasks.length;
  return { completed, total, remaining: total - completed };
}

function normalizeTag(tag: string): string {
  return tag.replace(/^#/, '').toLowerCase();
}

/**
 * True if the note carries any of the given trigger tags, matching both inline
 * `#tags` and frontmatter `tags` (which may be a string or an array).
 */
export function noteHasAnyTag(cache: CachedMetadata, tags: string[]): boolean {
  if (tags.length === 0) {
    return false;
  }
  const wanted = new Set(tags.map(normalizeTag));
  const fileTags = (getAllTags(cache) ?? []).map(normalizeTag);
  return fileTags.some((t) => wanted.has(t));
}

/** Structural equality used to skip redundant frontmatter writes. */
export function progressEquals(a: unknown, b: Progress): boolean {
  return (
    !!a &&
    typeof a === 'object' &&
    (a as Progress).completed === b.completed &&
    (a as Progress).total === b.total &&
    (a as Progress).remaining === b.remaining
  );
}
