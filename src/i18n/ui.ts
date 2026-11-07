import { INTL_LOCALE, type Locale } from '../lib/taxonomy';

// All interface text lives here as keys, never hardcoded in pages.
// Lesson text lives in the lessons themselves.

const ar = {
  'site.name': 'ديوان تيك',
  'site.tagline': 'تعلّم التقنية بلغة بسيطة، مجاناً وللجميع.',
  'site.intro':
    'دروس قصيرة وواضحة في التقنية تبدأ من الصفر. كل درس له مصادر موثوقة، وراجعه إنسان قبل نشره.',
  'nav.skip': 'تخطَّ إلى المحتوى',
  'nav.home': 'الرئيسية',
  'nav.language': 'اللغة',
  'home.topics': 'المواضيع',
  'topic.basics': 'أساسيات الحاسب والإنترنت',
  'topic.safety': 'الأمن الرقمي',
  'topic.ai': 'الذكاء الاصطناعي في الحياة اليومية',
  'topic.programming': 'البرمجة للمبتدئين',
  'topic.empty': 'الدروس قيد الإعداد.',
  'level.0': 'ابدأ من هنا',
  'level.1': 'مبتدئ',
  'level.2': 'متوسط',
  'level.3': 'متقدم',
  'level.label': 'المستوى {n}',
  'lessons.zero': 'لا توجد دروس بعد',
  'lessons.one': 'درس واحد',
  'lessons.two': 'درسان',
  'lessons.few': '{n} دروس',
  'lessons.many': '{n} درساً',
  'lessons.other': '{n} درس',
  'minutes.one': 'دقيقة واحدة',
  'minutes.two': 'دقيقتان',
  'minutes.few': '{n} دقائق',
  'minutes.many': '{n} دقيقة',
  'minutes.other': '{n} دقيقة',
  'lesson.objective': 'بعد هذا الدرس تستطيع:',
  'lesson.duration': 'مدة الدرس:',
  'lesson.platforms': 'ينطبق على:',
  'lesson.sources': 'المصادر',
  'lesson.accessed': 'تاريخ الاطلاع: {date}',
  'lesson.lastVerified': 'آخر تحقق من المعلومات: {date}',
  'lesson.disclosure':
    'كُتب هذا الدرس بمساعدة الذكاء الاصطناعي، وراجعه {reviewer} — فريق ديوان تيك، بتاريخ {date}.',
  'lesson.draft': 'مسودة: لم يُراجع هذا الدرس بعد، ولا يظهر في الموقع المنشور.',
  'lesson.prev': 'الدرس السابق: {title}',
  'lesson.next': 'الدرس التالي: {title}',
  'lesson.backToTopic': 'العودة إلى {topic}',
  'platform.android': 'أندرويد',
  'platform.ios': 'آيفون (iOS)',
  'platform.windows': 'ويندوز',
  'platform.macos': 'ماك',
  'footer.license': 'الكود مرخّص بـ MIT، والدروس مرخّصة بـ CC BY-SA 4.0.',
  'footer.source': 'الكود المفتوح على GitHub',
  'notFound.title': 'الصفحة غير موجودة',
  'notFound.back': 'العودة إلى الرئيسية',
  'report.link': 'وجدت خطأ في هذا الدرس؟',
  'report.title': 'أبلغ عن خطأ',
  'report.lesson': 'الدرس:',
  'report.intro': 'أخبرنا بما وجدته، وسنراجعه ونصحح الدرس إن كان فيه خطأ.',
  'report.privacy': 'لا نطلب اسمك ولا بريدك. ما تكتبه هنا يُنشر علناً على GitHub، فلا تكتب فيه معلومات شخصية.',
  'report.problem': 'ما الخطأ؟',
  'report.problemHelp': 'انسخ الجملة إن استطعت، واكتب الصحيح. وإن كان لديك مصدر فاذكره. من {min} إلى {max} حرف.',
  'report.honeypot': 'اترك هذا الحقل فارغاً',
  'report.submit': 'أرسل البلاغ',
  'report.sending': 'جارٍ الإرسال…',
  'report.success': 'شكراً لك. وصلنا بلاغك، وسنراجعه.',
  'report.successLink': 'تابع البلاغ على GitHub',
  'report.error.invalid': 'اكتب وصفاً للخطأ من {min} أحرف على الأقل، ثم أرسل مرة أخرى.',
  'report.error.captcha': 'لم يكتمل التحقق من أنك إنسان. انتظر حتى يكتمل، ثم أرسل مرة أخرى.',
  'report.error.rateLimited': 'أرسلت بلاغات كثيرة في وقت قصير. حاول مرة أخرى بعد ساعة.',
  'report.error.unavailable': 'النموذج لا يعمل الآن. يمكنك الإبلاغ على GitHub بدلاً منه، ويحتاج ذلك إلى حساب.',
  'report.noscript': 'يحتاج هذا النموذج إلى JavaScript. يمكنك الإبلاغ على GitHub بدلاً منه، ويحتاج ذلك إلى حساب.',
  'report.github': 'أبلغ على GitHub',
  'report.back': 'العودة إلى الدرس',
};

type Dict = Record<keyof typeof ar, string>;

const en: Dict = {
  'site.name': 'DiwanTC',
  'site.tagline': 'Learn technology in plain language — free, for everyone.',
  'site.intro':
    'Short, clear technology lessons that start from zero. Every lesson cites trusted sources and is reviewed by a person before it is published.',
  'nav.skip': 'Skip to content',
  'nav.home': 'Home',
  'nav.language': 'Language',
  'home.topics': 'Topics',
  'topic.basics': 'Computer & internet basics',
  'topic.safety': 'Digital safety',
  'topic.ai': 'Everyday AI',
  'topic.programming': 'Programming for beginners',
  'topic.empty': 'Lessons are being prepared.',
  'level.0': 'Start here',
  'level.1': 'Beginner',
  'level.2': 'Intermediate',
  'level.3': 'Advanced',
  'level.label': 'Level {n}',
  'lessons.zero': 'No lessons yet',
  'lessons.one': '1 lesson',
  'lessons.two': '{n} lessons',
  'lessons.few': '{n} lessons',
  'lessons.many': '{n} lessons',
  'lessons.other': '{n} lessons',
  'minutes.one': '1 min',
  'minutes.two': '{n} min',
  'minutes.few': '{n} min',
  'minutes.many': '{n} min',
  'minutes.other': '{n} min',
  'lesson.objective': 'After this lesson you can:',
  'lesson.duration': 'Lesson length:',
  'lesson.platforms': 'Applies to:',
  'lesson.sources': 'Sources',
  'lesson.accessed': 'Accessed {date}',
  'lesson.lastVerified': 'Facts last checked: {date}',
  'lesson.disclosure':
    'This lesson was written with AI assistance and reviewed by {reviewer} — DiwanTC team, on {date}.',
  'lesson.draft': 'Draft: this lesson has not been reviewed yet and is not shown on the live site.',
  'lesson.prev': 'Previous lesson: {title}',
  'lesson.next': 'Next lesson: {title}',
  'lesson.backToTopic': 'Back to {topic}',
  'platform.android': 'Android',
  'platform.ios': 'iPhone (iOS)',
  'platform.windows': 'Windows',
  'platform.macos': 'Mac',
  'footer.license': 'Code: MIT. Lessons: CC BY-SA 4.0.',
  'footer.source': 'Source code on GitHub',
  'notFound.title': 'Page not found',
  'notFound.back': 'Back to home',
  'report.link': 'Found a mistake in this lesson?',
  'report.title': 'Report a mistake',
  'report.lesson': 'Lesson:',
  'report.intro': 'Tell us what you found. We will check it and fix the lesson if it is wrong.',
  'report.privacy': 'We do not ask for your name or email. What you write here is published openly on GitHub, so do not include personal information.',
  'report.problem': 'What is wrong?',
  'report.problemHelp': 'Copy the sentence if you can, and write what is correct. Add a source if you have one. {min} to {max} characters.',
  'report.honeypot': 'Leave this field empty',
  'report.submit': 'Send report',
  'report.sending': 'Sending…',
  'report.success': 'Thank you. We received your report and will check it.',
  'report.successLink': 'Follow the report on GitHub',
  'report.error.invalid': 'Describe the mistake in at least {min} characters, then send again.',
  'report.error.captcha': 'The check that you are human did not finish. Wait for it, then send again.',
  'report.error.rateLimited': 'Too many reports in a short time. Please try again in an hour.',
  'report.error.unavailable': 'The form is not working right now. You can report on GitHub instead (you need an account).',
  'report.noscript': 'This form needs JavaScript. You can report on GitHub instead (you need an account).',
  'report.github': 'Report on GitHub',
  'report.back': 'Back to the lesson',
};

const fr: Dict = {
  'site.name': 'DiwanTC',
  'site.tagline': 'Apprenez la technologie simplement — gratuit et pour tous.',
  'site.intro':
    'Des leçons courtes et claires sur la technologie, en partant de zéro. Chaque leçon cite des sources fiables et est relue par une personne avant publication.',
  'nav.skip': 'Aller au contenu',
  'nav.home': 'Accueil',
  'nav.language': 'Langue',
  'home.topics': 'Thèmes',
  'topic.basics': "Les bases de l'informatique et d'internet",
  'topic.safety': 'La sécurité numérique',
  'topic.ai': "L'IA au quotidien",
  'topic.programming': 'La programmation pour débutants',
  'topic.empty': 'Les leçons sont en préparation.',
  'level.0': 'Commencer ici',
  'level.1': 'Débutant',
  'level.2': 'Intermédiaire',
  'level.3': 'Avancé',
  'level.label': 'Niveau {n}',
  'lessons.zero': 'Pas encore de leçons',
  'lessons.one': '{n} leçon',
  'lessons.two': '{n} leçons',
  'lessons.few': '{n} leçons',
  'lessons.many': '{n} leçons',
  'lessons.other': '{n} leçons',
  'minutes.one': '{n} min',
  'minutes.two': '{n} min',
  'minutes.few': '{n} min',
  'minutes.many': '{n} min',
  'minutes.other': '{n} min',
  'lesson.objective': 'Après cette leçon, vous pouvez :',
  'lesson.duration': 'Durée de la leçon :',
  'lesson.platforms': "S'applique à :",
  'lesson.sources': 'Sources',
  'lesson.accessed': 'Consulté le {date}',
  'lesson.lastVerified': 'Informations vérifiées le {date}',
  'lesson.disclosure':
    "Cette leçon a été rédigée avec l'aide de l'IA et relue par {reviewer} — équipe DiwanTC, le {date}.",
  'lesson.draft': "Brouillon : cette leçon n'a pas encore été relue et n'apparaît pas sur le site public.",
  'lesson.prev': 'Leçon précédente : {title}',
  'lesson.next': 'Leçon suivante : {title}',
  'lesson.backToTopic': 'Retour à : {topic}',
  'platform.android': 'Android',
  'platform.ios': 'iPhone (iOS)',
  'platform.windows': 'Windows',
  'platform.macos': 'Mac',
  'footer.license': 'Code : MIT. Leçons : CC BY-SA 4.0.',
  'footer.source': 'Code source sur GitHub',
  'notFound.title': 'Page introuvable',
  'notFound.back': "Retour à l'accueil",
  'report.link': 'Une erreur dans cette leçon\u202f?',
  'report.title': 'Signaler une erreur',
  'report.lesson': 'Leçon\u00a0:',
  'report.intro': "Dites-nous ce que vous avez trouvé. Nous vérifierons et corrigerons la leçon si elle contient une erreur.",
  'report.privacy': "Nous ne demandons ni votre nom ni votre e-mail. Votre message est publié sur GitHub, visible par tous\u00a0: n'y mettez pas d'informations personnelles.",
  'report.problem': "Qu'est-ce qui ne va pas\u202f?",
  'report.problemHelp': 'Copiez la phrase si possible et indiquez ce qui est correct. Ajoutez une source si vous en avez une. De {min} à {max} caractères.',
  'report.honeypot': 'Laissez ce champ vide',
  'report.submit': 'Envoyer le signalement',
  'report.sending': 'Envoi en cours…',
  'report.success': 'Merci. Nous avons bien reçu votre signalement et nous allons le vérifier.',
  'report.successLink': 'Suivre le signalement sur GitHub',
  'report.error.invalid': "Décrivez l'erreur en {min} caractères au moins, puis renvoyez le formulaire.",
  'report.error.captcha': "La vérification anti-robot n'est pas terminée. Attendez qu'elle aboutisse, puis renvoyez le formulaire.",
  'report.error.rateLimited': 'Trop de signalements en peu de temps. Réessayez dans une heure.',
  'report.error.unavailable': "Le formulaire ne fonctionne pas pour le moment. Vous pouvez signaler l'erreur sur GitHub (un compte est nécessaire).",
  'report.noscript': "Ce formulaire a besoin de JavaScript. Vous pouvez signaler l'erreur sur GitHub (un compte est nécessaire).",
  'report.github': 'Signaler sur GitHub',
  'report.back': 'Retour à la leçon',
};

const dictionaries: Record<Locale, Dict> = { ar, en, fr };
export type UIKey = keyof Dict;

/** Translate a key and fill {placeholders}. */
export function t(locale: Locale, key: UIKey, vars: Record<string, string | number> = {}): string {
  const template = dictionaries[locale][key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

type PluralBase = 'lessons' | 'minutes';

/** Plural-aware text using the language's own plural rules (Arabic has six forms). */
export function tPlural(locale: Locale, base: PluralBase, n: number): string {
  const category = new Intl.PluralRules(INTL_LOCALE[locale]).select(n);
  const candidate = `${base}.${category}`;
  const key = (candidate in dictionaries[locale] ? candidate : `${base}.other`) as UIKey;
  return t(locale, key, { n: formatNumber(locale, n) });
}

export function formatNumber(locale: Locale, n: number): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale]).format(n);
}

export function formatList(locale: Locale, items: string[]): string {
  return new Intl.ListFormat(INTL_LOCALE[locale], { style: 'long', type: 'conjunction' }).format(items);
}

export function formatDate(locale: Locale, date: Date): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
