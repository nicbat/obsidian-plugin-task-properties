import { CachedMetadata, getAllTags } from 'obsidian';

export interface Progress {
  completed: number;
  total: number;
  remaining: number;
  percentage?: number;
}

/**
 * Counts checkbox tasks in a file's cache.
 *
 * Obsidian stores a task's checked status in `listItem.task` as a single
 * character: `' '` is incomplete and any other character (`x`, `X`, `/`, `-`,
 * ...) is complete. `undefined` means the list item is not a task at all.
 * All tasks count regardless of nesting depth.
 *
 * When `includePercentage` is set, a `percentage` field (0–100, rounded) is
 * added; it is `0` when the note has no tasks.
 */
export function computeProgress(
  cache: CachedMetadata,
  includePercentage = false
): Progress {
  const tasks = (cache.listItems ?? []).filter((i) => i.task !== undefined);
  const completed = tasks.filter((i) => i.task !== ' ').length;
  const total = tasks.length;
  const progress: Progress = { completed, total, remaining: total - completed };
  if (includePercentage) {
    progress.percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  }
  return progress;
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
  const wanted = new Set(tags.map(normalizeTag).filter((t) => t.length > 0));
  if (wanted.size === 0) {
    return false;
  }
  const fileTags = (getAllTags(cache) ?? []).map(normalizeTag);
  return fileTags.some((t) => wanted.has(t));
}

/** Structural equality used to skip redundant frontmatter writes. */
export function progressEquals(a: unknown, b: Progress): boolean {
  if (!a || typeof a !== 'object') {
    return false;
  }
  const p = a as Progress;
  return (
    p.completed === b.completed &&
    p.total === b.total &&
    p.remaining === b.remaining &&
    p.percentage === b.percentage
  );
}
