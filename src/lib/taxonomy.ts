// Single source of truth for languages, topics, levels and platforms.
// Used by the content schema, the pages and the UI strings.

export const LOCALES = ['ar', 'en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ar';

export const DIRECTION: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
  fr: 'ltr',
};

/** Native language names, shown in the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
};

/**
 * Locale tags for Intl formatting. Arabic uses Western digits (0–9) and the
 * Gregorian calendar — decided 2026-11-06 for consistency with screens and codes.
 */
export const INTL_LOCALE: Record<Locale, string> = {
  ar: 'ar-u-ca-gregory-nu-latn',
  en: 'en',
  fr: 'fr',
};

export const TOPICS = ['basics', 'safety', 'ai', 'programming'] as const;
export type Topic = (typeof TOPICS)[number];

export const LEVELS = [0, 1, 2, 3] as const;
export type Level = (typeof LEVELS)[number];

export const PLATFORMS = ['android', 'ios', 'windows', 'macos'] as const;
export type Platform = (typeof PLATFORMS)[number];

export function isLocale(value: string | undefined): value is Locale {
  return (LOCALES as readonly string[]).includes(value ?? '');
}

/** How a reporting channel is reached (src/data/reporting-channels). */
export const CHANNEL_TYPES = ['sms', 'phone', 'website', 'app', 'email'] as const;
export type ChannelType = (typeof CHANNEL_TYPES)[number];

/** Reporting-channel entries are re-verified every 3 months (decided 2026-11-06). */
export const CHANNEL_REVERIFY_MONTHS = 3;
