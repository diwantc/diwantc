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
  'seconds.one': 'ثانية واحدة',
  'seconds.two': 'ثانيتين',
  'seconds.few': '{n} ثوانٍ',
  'seconds.many': '{n} ثانية',
  'seconds.other': '{n} ثانية',
  'lines.one': 'سطر واحد',
  'lines.two': 'سطرين',
  'lines.few': '{n} أسطر',
  'lines.many': '{n} سطراً',
  'lines.other': '{n} سطر',
  'runner.label': 'مشغّل الكود',
  'runner.code': 'الكود ({language})',
  'runner.hint':
    'عدّل الكود كما تريد، ثم اضغط «تشغيل» لترى النتيجة. للتشغيل من لوحة المفاتيح: Ctrl+Enter (أو ⌘+Enter في ماك).',
  'runner.run': 'تشغيل',
  'runner.stop': 'إيقاف',
  'runner.reset': 'أعد الكود الأصلي',
  'runner.output': 'النتيجة',
  'runner.noscript': 'تشغيل الكود يحتاج إلى JavaScript، وهو متوقف في متصفحك. ما زال بإمكانك قراءة الكود.',
  'runner.status.running': 'البرنامج يعمل…',
  'runner.status.done': 'انتهى البرنامج.',
  'runner.status.empty': 'انتهى البرنامج ولم يطبع شيئاً. استعمل console.log لتطبع نتيجة.',
  'runner.status.error': 'حدث خطأ.',
  'runner.status.errorLine': 'حدث خطأ في السطر {line}.',
  'runner.status.timeout': 'أوقفنا البرنامج لأنه لم ينتهِ خلال {duration}. ربما فيه حلقة تكرار لا تنتهي.',
  'runner.status.stopped': 'أوقفتَ البرنامج.',
  'runner.status.limit': 'أوقفنا البرنامج لأنه طبع أكثر من {count}.',
  'runner.status.unsupported': 'لا يستطيع هذا المتصفح تشغيل الكود هنا بأمان. جرّب متصفحاً أحدث.',
  'runner.status.unavailable': 'تعذّر تجهيز مشغّل الكود. تحقق من اتصالك بالإنترنت، ثم اضغط «تشغيل» مرة أخرى.',
  'runner.status.reset': 'أُعيد الكود الأصلي.',
  'runner.status.tooLong': 'الكود طويل جداً فلم يُشغَّل. اختصره ثم جرّب مرة أخرى.',
  'runner.level.warn': 'تحذير:',
  'runner.level.error': 'خطأ:',
  'runner.explain.SyntaxError':
    'SyntaxError يعني أن الكود لا يتبع قواعد كتابة اللغة، فلم يستطع المتصفح فهمه. تحقق من الأقواس وعلامات التنصيص.',
  'runner.explain.ReferenceError':
    'ReferenceError يعني أنك استعملت اسماً غير موجود، أو استعملته قبل تعريفه. تحقق من كتابة الاسم: الحروف الكبيرة والصغيرة مختلفة.',
  'runner.explain.TypeError':
    'TypeError يعني أن عملية لم تنجح، غالباً لأن قيمة ليست من النوع المتوقع، مثل استدعاء شيء ليس دالة.',
  'runner.explain.RangeError': 'RangeError يعني أن قيمة خرجت عن المجال المسموح به.',
  'runner.explain.other': 'اقرأ رسالة الخطأ في النتيجة لتعرف السبب.',
  'footer.license': 'الكود مرخّص بـ MIT، والدروس مرخّصة بـ CC BY-SA 4.0.',
  'footer.source': 'الكود المفتوح على GitHub',
  'notFound.title': 'الصفحة غير موجودة',
  'notFound.back': 'العودة إلى الرئيسية',
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
  'seconds.one': '1 second',
  'seconds.two': '{n} seconds',
  'seconds.few': '{n} seconds',
  'seconds.many': '{n} seconds',
  'seconds.other': '{n} seconds',
  'lines.one': '1 line',
  'lines.two': '{n} lines',
  'lines.few': '{n} lines',
  'lines.many': '{n} lines',
  'lines.other': '{n} lines',
  'runner.label': 'Code runner',
  'runner.code': 'Code ({language})',
  'runner.hint':
    'Change the code as you like, then press Run to see the result. To run it from the keyboard: Ctrl+Enter (or ⌘+Enter on a Mac).',
  'runner.run': 'Run',
  'runner.stop': 'Stop',
  'runner.reset': 'Reset code',
  'runner.output': 'Output',
  'runner.noscript': 'Running code needs JavaScript, which is turned off in your browser. You can still read the code.',
  'runner.status.running': 'The program is running…',
  'runner.status.done': 'The program finished.',
  'runner.status.empty': 'The program finished without printing anything. Use console.log to print a result.',
  'runner.status.error': 'An error occurred.',
  'runner.status.errorLine': 'An error occurred on line {line}.',
  'runner.status.timeout':
    'We stopped the program because it did not finish within {duration}. It may have a loop that never ends.',
  'runner.status.stopped': 'You stopped the program.',
  'runner.status.limit': 'We stopped the program because it printed more than {count}.',
  'runner.status.unsupported': 'This browser cannot run the code here safely. Try a newer browser.',
  'runner.status.unavailable': 'The code runner could not start. Check your internet connection, then press Run again.',
  'runner.status.reset': 'The original code is back.',
  'runner.status.tooLong': 'The code is too long to run. Shorten it and try again.',
  'runner.level.warn': 'Warning:',
  'runner.level.error': 'Error:',
  'runner.explain.SyntaxError':
    'SyntaxError means the code does not follow the rules of the language, so the browser could not understand it. Check your brackets and quotation marks.',
  'runner.explain.ReferenceError':
    'ReferenceError means you used a name that does not exist, or used it before defining it. Check the spelling: capital and small letters are different.',
  'runner.explain.TypeError':
    'TypeError means an operation could not be done, often because a value is not of the expected type, such as calling something that is not a function.',
  'runner.explain.RangeError': 'RangeError means a value is outside the allowed range.',
  'runner.explain.other': 'Read the error message in the output to see what went wrong.',
  'footer.license': 'Code: MIT. Lessons: CC BY-SA 4.0.',
  'footer.source': 'Source code on GitHub',
  'notFound.title': 'Page not found',
  'notFound.back': 'Back to home',
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
  'seconds.one': '{n} seconde',
  'seconds.two': '{n} secondes',
  'seconds.few': '{n} secondes',
  'seconds.many': '{n} secondes',
  'seconds.other': '{n} secondes',
  'lines.one': '{n} ligne',
  'lines.two': '{n} lignes',
  'lines.few': '{n} lignes',
  'lines.many': '{n} lignes',
  'lines.other': '{n} lignes',
  'runner.label': 'Exécuteur de code',
  'runner.code': 'Code ({language})',
  'runner.hint':
    'Modifiez le code comme vous voulez, puis appuyez sur « Exécuter » pour voir le résultat. Au clavier : Ctrl+Entrée (ou ⌘+Entrée sur Mac).',
  'runner.run': 'Exécuter',
  'runner.stop': 'Arrêter',
  'runner.reset': 'Rétablir le code',
  'runner.output': 'Résultat',
  'runner.noscript':
    "L'exécution du code nécessite JavaScript, qui est désactivé dans votre navigateur. Vous pouvez quand même lire le code.",
  'runner.status.running': "Le programme est en cours d'exécution…",
  'runner.status.done': 'Le programme est terminé.',
  'runner.status.empty': "Le programme s'est terminé sans rien afficher. Utilisez console.log pour afficher un résultat.",
  'runner.status.error': 'Une erreur est survenue.',
  'runner.status.errorLine': 'Une erreur est survenue à la ligne {line}.',
  'runner.status.timeout':
    "Nous avons arrêté le programme, car il ne s'est pas terminé en {duration}. Il contient peut-être une boucle qui ne s'arrête jamais.",
  'runner.status.stopped': 'Vous avez arrêté le programme.',
  'runner.status.limit': 'Nous avons arrêté le programme, car il a affiché plus de {count}.',
  'runner.status.unsupported':
    'Ce navigateur ne peut pas exécuter le code ici en toute sécurité. Essayez un navigateur plus récent.',
  'runner.status.unavailable':
    "L'exécuteur de code n'a pas pu démarrer. Vérifiez votre connexion internet, puis appuyez de nouveau sur « Exécuter ».",
  'runner.status.reset': "Le code d'origine est rétabli.",
  'runner.status.tooLong': 'Le code est trop long pour être exécuté. Raccourcissez-le, puis réessayez.',
  'runner.level.warn': 'Avertissement :',
  'runner.level.error': 'Erreur :',
  'runner.explain.SyntaxError':
    "SyntaxError signifie que le code ne respecte pas les règles du langage : le navigateur n'a pas pu le comprendre. Vérifiez les parenthèses et les guillemets.",
  'runner.explain.ReferenceError':
    "ReferenceError signifie que vous avez utilisé un nom qui n'existe pas, ou avant de l'avoir défini. Vérifiez l'orthographe : majuscules et minuscules sont différentes.",
  'runner.explain.TypeError':
    "TypeError signifie qu'une opération n'a pas pu être faite, souvent parce qu'une valeur n'est pas du type attendu, par exemple appeler quelque chose qui n'est pas une fonction.",
  'runner.explain.RangeError': "RangeError signifie qu'une valeur est en dehors des limites autorisées.",
  'runner.explain.other': "Lisez le message d'erreur dans le résultat pour comprendre ce qui s'est passé.",
  'footer.license': 'Code : MIT. Leçons : CC BY-SA 4.0.',
  'footer.source': 'Code source sur GitHub',
  'notFound.title': 'Page introuvable',
  'notFound.back': "Retour à l'accueil",
};

const dictionaries: Record<Locale, Dict> = { ar, en, fr };
export type UIKey = keyof Dict;

/** Translate a key and fill {placeholders}. */
export function t(locale: Locale, key: UIKey, vars: Record<string, string | number> = {}): string {
  const template = dictionaries[locale][key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

// Arabic seconds/lines forms are genitive: they follow a preposition (خلال، أكثر من).
type PluralBase = 'lessons' | 'minutes' | 'seconds' | 'lines';

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
