// Shared helpers for the content scripts: find lesson files and split
// frontmatter from body. No Astro needed, so they run fast in CI.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

export const LOCALES = ['ar', 'en', 'fr'];
export const TOPICS = ['basics', 'safety', 'ai', 'programming'];

export function lessonsRoot(cliArg) {
  return path.resolve(cliArg ?? process.env.LESSONS_DIR ?? 'src/content/lessons');
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (/\.mdx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

/** Returns [{ file, rel, frontmatter, body, parseError }] for every lesson file. */
export async function readLessons(root) {
  if (!(await exists(root))) return [];
  const files = (await walk(root)).sort();
  const lessons = [];
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const rel = path.relative(root, file).split(path.sep).join('/');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) {
      lessons.push({ file, rel, frontmatter: null, body: raw, parseError: 'missing frontmatter block' });
      continue;
    }
    try {
      lessons.push({ file, rel, frontmatter: parseYaml(match[1]) ?? {}, body: match[2], parseError: null });
    } catch (error) {
      lessons.push({ file, rel, frontmatter: null, body: match[2], parseError: `invalid YAML: ${error.message}` });
    }
  }
  return lessons;
}

/** Prints a message, as a GitHub annotation when running in Actions. */
export function report(kind, file, message) {
  const rel = path.relative(process.cwd(), file);
  if (process.env.GITHUB_ACTIONS) console.log(`::${kind} file=${rel}::${message}`);
  else console.log(`${kind === 'error' ? '✗' : '!'} ${rel}: ${message}`);
}
