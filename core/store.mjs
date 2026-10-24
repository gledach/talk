import fs from 'node:fs';
import { paths, ensureDataDir } from './paths.mjs';

export function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export function saveJson(file, value) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(value));
}

export function appendLine(file, line) {
  ensureDataDir();
  fs.appendFileSync(file, line.endsWith('\n') ? line : `${line}\n`);
}

export function loadState() {
  const hosts = loadJson(paths.hosts, {});
  const seen = loadJson(paths.seen, {});
  const pids = loadJson(paths.pids, {});
  const last = loadJson(paths.last, { totals: {}, orphans: null });
  return { hosts, seen, pids, last };
}

export function saveState(state) {
  saveJson(paths.hosts, state.hosts);
  saveJson(paths.seen, state.seen);
  saveJson(paths.pids, state.pids);
  saveJson(paths.last, state.last);
}
