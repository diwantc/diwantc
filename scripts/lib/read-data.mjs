// Reads the reporting-channel data files (src/data/reporting-channels/<cc>.yaml).
// The Astro schema in src/content.config.ts validates them at build time;
// these helpers let the fast Node scripts (links, re-verify, tests) use them.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

export function channelsRoot(cliArg) {
  return path.resolve(cliArg ?? process.env.CHANNELS_DIR ?? 'src/data/reporting-channels');
}

/** Returns [{ file, rel, data, parseError }] for every country file. */
export async function readReportingChannels(root = channelsRoot()) {
  try {
    await stat(root);
  } catch {
    return [];
  }
  const names = (await readdir(root)).filter((name) => name.endsWith('.yaml')).sort();
  const out = [];
  for (const name of names) {
    const file = path.join(root, name);
    const rel = name;
    try {
      out.push({ file, rel, data: parseYaml(await readFile(file, 'utf8')) ?? {}, parseError: null });
    } catch (error) {
      out.push({ file, rel, data: null, parseError: `invalid YAML: ${error.message}` });
    }
  }
  return out;
}
