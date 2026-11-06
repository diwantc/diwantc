import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale, Topic } from './taxonomy';

export type Lesson = CollectionEntry<'lessons'>;

/**
 * Preview builds (Cloudflare Pages preview environment) set SHOW_DRAFTS=true.
 * The live site only ever shows approved lessons.
 */
export const SHOW_DRAFTS = process.env.SHOW_DRAFTS === 'true';

export function isVisible(lesson: Lesson): boolean {
  return SHOW_DRAFTS || lesson.data.review.status === 'approved';
}

/** Visible lessons, sorted by level then order. */
export async function getLessons(filter: { lang?: Locale; topic?: Topic } = {}): Promise<Lesson[]> {
  const all = await getCollection('lessons', (entry) => isVisible(entry));
  return all
    .filter((entry) => !filter.lang || entry.data.lang === filter.lang)
    .filter((entry) => !filter.topic || entry.data.topic === filter.topic)
    .sort((a, b) => a.data.level - b.data.level || a.data.order - b.data.order);
}

/** File `01-strong-passwords.mdx` → slug `strong-passwords`. Same slug in every language. */
export function lessonSlug(lesson: Lesson): string {
  const file = lesson.id.split('/').pop() ?? lesson.id;
  return file.replace(/^\d{2}-/, '');
}

export function lessonPath(lesson: Lesson): string {
  const { lang, topic, level } = lesson.data;
  return `/${lang}/${topic}/${level}/${lessonSlug(lesson)}/`;
}
