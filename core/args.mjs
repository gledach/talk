/* --key=value, --key value, and --flag. Unknown flags are kept. */

export function parseArgs(argv) {
  const out = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('-')) {
      out._.push(a);
      continue;
    }
    const long = a.replace(/^--?/, '');
    if (long.includes('=')) {
      const [k, ...rest] = long.split('=');
      out.flags[k] = rest.join('=');
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('-')) {
      out.flags[long] = next;
      i += 1;
    } else {
      out.flags[long] = true;
    }
  }
  return out;
}

export function num(value, fallback) {
  if (value === undefined || value === true) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function flag(value) {
  return value === true || value === 'true' || value === '1';
}
