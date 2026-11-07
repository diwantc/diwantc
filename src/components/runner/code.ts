// Pure helpers shared by the runner component and the tests. No imports, so
// Node can load this file directly in tests.

/**
 * Tidies the `code` prop written in MDX: drops the blank first and last
 * lines that a template literal leaves, trailing spaces, and the common
 * indentation, so authors can indent the code with the JSX around it.
 */
export function normalizeCode(code: string): string {
  const lines = code.replace(/\r\n?/g, '\n').split('\n').map((line) => line.replace(/[ \t]+$/, ''));
  while (lines.length > 0 && lines[0] === '') lines.shift();
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  const indents = lines.filter((line) => line !== '').map((line) => /^[ \t]*/.exec(line)![0].length);
  const common = indents.length > 0 ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(common)).join('\n');
}

/** Rows for the editor: one per line of code, within sensible bounds. */
export function editorRows(code: string, min = 3, max = 24): number {
  const count = code.split('\n').length;
  return Math.min(Math.max(count, min), max);
}

// Scripts written right to left: Hebrew, Arabic, Syriac, Thaana, N'Ko.
const RTL_LETTER = /[\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}]/u;
const LETTER = /\p{L}/u;

/**
 * Direction of an output line, from its first letter, like dir="auto" but
 * skipping text inside Unicode isolates (U+2066–U+2069), as the Unicode
 * bidi algorithm does. Lines with no letters are left-to-right.
 */
export function textDirection(text: string): 'ltr' | 'rtl' {
  let isolated = 0;
  for (const char of text) {
    if (char >= '\u2066' && char <= '\u2068') isolated++;
    else if (char === '\u2069') isolated = Math.max(0, isolated - 1);
    else if (isolated === 0 && RTL_LETTER.test(char)) return 'rtl';
    else if (isolated === 0 && LETTER.test(char)) return 'ltr';
  }
  return 'ltr';
}

/** Text shown in the output for an error, like a browser console prints it. */
export function errorText(name: string, message: string): string {
  if (!name) return `Uncaught ${message}`;
  return message ? `${name}: ${message}` : name;
}
