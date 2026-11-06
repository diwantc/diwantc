import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LOCALES, PLATFORMS, TOPICS } from './lib/taxonomy';

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

export const collections = { lessons };
