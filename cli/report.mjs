import { loadJson } from '../core/store.mjs';
import { paths } from '../core/paths.mjs';
import { printSample } from '../core/format.mjs';

export default async function report() {
  const latest = loadJson(paths.latest, null);
  if (!latest) {
    console.log('gledach-talk: no sample yet. Run `node bin/talk.mjs once`.');
    return 1;
  }
  printSample(latest, 20);
  return 0;
}
