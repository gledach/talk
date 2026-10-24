import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const DATA_DIR = process.env.TALK_DATA
  ? path.resolve(process.env.TALK_DATA)
  : path.join(ROOT, 'data');

export const paths = {
  root: ROOT,
  data: DATA_DIR,
  snapshotScript: path.join(ROOT, 'core', 'win-snapshot.ps1'),
  samples: path.join(DATA_DIR, 'samples.jsonl'),
  alerts: path.join(DATA_DIR, 'alerts.log'),
  hosts: path.join(DATA_DIR, 'hosts.json'),
  seen: path.join(DATA_DIR, 'seen.json'),
  pids: path.join(DATA_DIR, 'pids.json'),
  last: path.join(DATA_DIR, 'last.json'),
  latest: path.join(DATA_DIR, 'latest.json'),
};

export function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  return DATA_DIR;
}
