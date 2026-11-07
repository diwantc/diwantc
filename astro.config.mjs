// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://diwantc.com',
  i18n: {
    locales: ['ar', 'en', 'fr'],
    defaultLocale: 'ar',
    routing: {
      // Every page lives under its language: /ar/…, /en/…, /fr/…
      prefixDefaultLocale: true,
      // "/" is handled by src/pages/index.astro and public/_redirects.
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      // Report forms (/<lang>/report/<lessonId>/) are not content pages.
      filter: (page) => !/\/(ar|en|fr)\/report\//.test(new URL(page).pathname),
      i18n: {
        defaultLocale: 'ar',
        locales: { ar: 'ar', en: 'en', fr: 'fr' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
