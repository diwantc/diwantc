import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CHANNEL_TYPES, LOCALES, PLATFORMS, TOPICS } from './lib/taxonomy';

// Lessons live in src/content/lessons/<lang>/<topic>/l<level>/<nn>-<slug>.mdx
// LESSONS_DIR lets `npm run dev:demo` point at the test fixtures instead.
const LESSONS_DIR = process.env.LESSONS_DIR ?? './src/content/lessons';

const source = z.object({
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.url(),
  lang: z.string().min(2),
  accessed: z.coerce.date(),
  supports: z.string().min(1),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: LESSONS_DIR }),
  schema: z
    .object({
      lessonId: z.string().regex(/^(basics|safety|ai|programming)-l[0-3]-\d{2}$/),
      lang: z.enum(LOCALES),
      sourceLang: z.enum(LOCALES),
      topic: z.enum(TOPICS),
      level: z.number().int().min(0).max(3),
      track: z.string().optional(),
      order: z.number().int().min(1),
      title: z.string().min(1),
      summary: z.string().min(1),
      objective: z.string().min(1),
      duration: z.number().int().positive(),
      prerequisites: z.array(z.string()).default([]),
      terms: z.array(z.string()).default([]),
      sources: z.array(source).min(1),
      lastVerified: z.coerce.date(),
      platforms: z.array(z.enum(PLATFORMS)).optional(),
      ai: z.object({
        assisted: z.boolean(),
        model: z.string().optional(),
      }),
      review: z.object({
        status: z.enum(['draft', 'in-review', 'approved']),
        reviewer: z.string().optional(),
        date: z.coerce.date().optional(),
        notes: z.string().optional(),
      }),
    })
    .superRefine((lesson, ctx) => {
      if (lesson.ai.assisted && !lesson.ai.model) {
        ctx.addIssue({
          code: 'custom',
          path: ['ai', 'model'],
          message: 'ai.model is required when ai.assisted is true',
        });
      }
      if (lesson.review.status === 'approved' && (!lesson.review.reviewer || !lesson.review.date)) {
        ctx.addIssue({
          code: 'custom',
          path: ['review'],
          message: 'approved lessons need review.reviewer and review.date',
        });
      }
      if (lesson.track && lesson.level === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['track'],
          message: 'track is only used from level 1',
        });
      }
    }),
});

// Official reporting channels per country, for safety-l0-07 (one YAML file per
// country in src/data/reporting-channels). Contacts are the same in every
// language; names and descriptions are translated. An entry without an
// official https source does not validate, so it is never shown.
const localized = z.object({ ar: z.string().min(1), en: z.string().min(1), fr: z.string().min(1) });

const channel = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: z.enum(CHANNEL_TYPES),
    // Numbers and web addresses are the same in every language; an app name may be translated.
    contact: z.union([z.string().min(1), localized]),
    name: localized,
    use: localized,
    source: z.object({
      title: z.string().min(1),
      publisher: localized,
      url: z.url().refine((url) => url.startsWith('https://'), 'source.url must use https'),
      lang: z.string().min(2),
    }),
    lastVerified: z.coerce.date(),
  })
  .superRefine((entry, ctx) => {
    if (typeof entry.contact !== 'string') {
      if (entry.type !== 'app') ctx.addIssue({ code: 'custom', path: ['contact'], message: 'only an app name may be translated' });
      return;
    }
    if (entry.type === 'website' && !/^https:\/\//.test(entry.contact)) {
      ctx.addIssue({ code: 'custom', path: ['contact'], message: 'a website contact must be an https URL' });
    }
    if ((entry.type === 'sms' || entry.type === 'phone') && !/^\+?[0-9 ]{3,20}$/.test(entry.contact)) {
      ctx.addIssue({ code: 'custom', path: ['contact'], message: 'an sms or phone contact must be digits' });
    }
  });

const reportingChannels = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/data/reporting-channels' }),
  schema: z.object({
    country: z.string().regex(/^[a-z]{2}$/),
    order: z.number().int().min(1),
    name: localized,
    channels: z.array(channel).min(1),
  }),
});

export const collections = { lessons, reportingChannels };
