import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { ensureDataDir, paths } from '../core/paths.mjs';

export default async function doctor() {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  console.log(`node ${process.versions.node}  ${nodeMajor >= 22 ? 'ok' : 'need >= 22'}`);
  console.log(`platform ${process.platform}  ${process.platform === 'win32' ? 'ok' : 'sample runs on Windows only'}`);
  console.log(`sampler ${fs.existsSync(paths.snapshotScript) ? 'ok' : 'missing'}  ${paths.snapshotScript}`);
  ensureDataDir();
  console.log(`data ${paths.data}`);
  if (process.platform === 'win32') {
    const probe = spawnSync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', 'Write-Output ok'],
      { encoding: 'utf8' },
    );
    const out = probe.stdout ?? '';
    console.log(`powershell ${out.includes('ok') ? 'ok' : 'missing'}`);
  }
  return 0;
}
