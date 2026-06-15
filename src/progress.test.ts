import { describe, it, expect } from 'vitest';
import type { CachedMetadata } from 'obsidian';
import { computeProgress, noteHasAnyTag, progressEquals } from './progress';

function cache(partial: Partial<CachedMetadata>): CachedMetadata {
  return partial as CachedMetadata;
}

function listItems(...tasks: (string | undefined)[]): CachedMetadata {
  return cache({
    listItems: tasks.map((task) => ({ task })) as CachedMetadata['listItems'],
  });
}

describe('computeProgress', () => {
  it('counts completed, total, and remaining', () => {
    expect(computeProgress(listItems('x', ' ', ' '))).toEqual({
      completed: 1,
      total: 3,
      remaining: 2,
    });
  });

  it('treats any non-space character as completed', () => {
    expect(computeProgress(listItems('x', 'X', '/', '-', ' '))).toEqual({
      completed: 4,
      total: 5,
      remaining: 1,
    });
  });

  it('ignores list items that are not tasks', () => {
    expect(computeProgress(listItems('x', undefined, ' ', undefined))).toEqual({
      completed: 1,
      total: 2,
      remaining: 1,
    });
  });

  it('returns zeros when there are no tasks', () => {
    expect(computeProgress(cache({}))).toEqual({
      completed: 0,
      total: 0,
      remaining: 0,
    });
  });

  it('adds a rounded percentage when requested', () => {
    expect(computeProgress(listItems('x', 'x', ' '), true).percentage).toBe(67);
  });

  it('reports 0 percent when there are no tasks', () => {
    expect(computeProgress(cache({}), true).percentage).toBe(0);
  });

  it('omits percentage when not requested', () => {
    expect(computeProgress(listItems('x'), false).percentage).toBeUndefined();
  });
});

describe('noteHasAnyTag', () => {
  it('matches an inline tag', () => {
    const c = cache({ tags: [{ tag: '#goal' }] as CachedMetadata['tags'] });
    expect(noteHasAnyTag(c, ['goal'])).toBe(true);
  });

  it('matches a frontmatter array tag', () => {
    const c = cache({ frontmatter: { tags: ['project', 'goal'] } });
    expect(noteHasAnyTag(c, ['goal'])).toBe(true);
  });

  it('matches a comma-separated frontmatter string tag', () => {
    const c = cache({ frontmatter: { tags: 'project, goal' } });
    expect(noteHasAnyTag(c, ['goal'])).toBe(true);
  });

  it('matches case-insensitively and ignores a leading #', () => {
    const c = cache({ tags: [{ tag: '#Goal' }] as CachedMetadata['tags'] });
    expect(noteHasAnyTag(c, ['#GOAL'])).toBe(true);
  });

  it('returns false when no configured tag is present', () => {
    const c = cache({ tags: [{ tag: '#task' }] as CachedMetadata['tags'] });
    expect(noteHasAnyTag(c, ['goal'])).toBe(false);
  });

  it('returns false when the tag list is empty or blank', () => {
    const c = cache({ tags: [{ tag: '#goal' }] as CachedMetadata['tags'] });
    expect(noteHasAnyTag(c, [])).toBe(false);
    expect(noteHasAnyTag(c, ['', '  '])).toBe(false);
  });
});

describe('progressEquals', () => {
  const base = { completed: 1, total: 2, remaining: 1 };

  it('is true for structurally equal progress', () => {
    expect(progressEquals({ ...base }, base)).toBe(true);
  });

  it('is false when a count differs', () => {
    expect(progressEquals({ ...base, completed: 2 }, base)).toBe(false);
  });

  it('is false for non-objects', () => {
    expect(progressEquals(undefined, base)).toBe(false);
    expect(progressEquals('progress', base)).toBe(false);
  });

  it('compares the percentage field', () => {
    const withPct = { ...base, percentage: 50 };
    expect(progressEquals({ ...base, percentage: 50 }, withPct)).toBe(true);
    expect(progressEquals(base, withPct)).toBe(false);
    expect(progressEquals(withPct, base)).toBe(false);
  });
});
