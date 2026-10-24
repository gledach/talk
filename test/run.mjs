import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const tests = ['agents.test.mjs', 'shape.test.mjs'];
let failed = 0;
for (const file of tests) {
  const run = spawnSync(process.execPath, [path.join(dir, file)], { stdio: 'inherit' });
  if (run.status !== 0) failed += 1;
}
if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log(`${tests.length} passed`);
