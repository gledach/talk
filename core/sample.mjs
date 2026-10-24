import { spawn } from 'node:child_process';
import { paths } from './paths.mjs';
import { isAgent } from './agents.mjs';
import { isPrivateIp } from './net.mjs';
import { certName } from './cert.mjs';
import { loadState, saveState, saveJson, appendLine } from './store.mjs';

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** ConvertTo-Json unwraps a one-element array into a bare value. */
export function normalizeRow(row) {
  const states = row?.states;
  return {
    pid: row?.pid ?? 0,
    alive: Boolean(row?.alive),
    total: Number(row?.total ?? 0),
    states: states && typeof states === 'object' && !Array.isArray(states) ? states : {},
    public443: asArray(row?.public443).map(String),
    ancestors: asArray(row?.ancestors),
  };
}

export function optionsFromFlags(flags) {
  const num = (key, fallback) => {
    const v = flags[key];
    if (v === undefined || v === true) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  return {
    alertAt: num('alert-at', 500),
    climbAt: num('climb-at', 30),
    peeks: num('peeks', 4),
    top: num('top', 12),
    noCert: flags['no-cert'] === true || flags['no-cert'] === 'true',
    intervalSec: num('interval', 60),
  };
}

function decodeSnapshot(buf) {
  if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
    return buf.subarray(2).toString('utf16le');
  }
  if (buf.length >= 4 && buf[1] === 0 && buf[3] === 0) {
    return buf.toString('utf16le');
  }
  return buf.toString('utf8');
}

export function snapshotWindows() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', paths.snapshotScript],
      { windowsHide: true },
    );
    const out = [];
    const err = [];
    child.stdout.on('data', (b) => out.push(b));
    child.stderr.on('data', (b) => err.push(b));
    child.on('error', reject);
    child.on('close', (code) => {
      const text = decodeSnapshot(Buffer.concat(out)).trim();
      if (code !== 0) {
        reject(new Error(decodeSnapshot(Buffer.concat(err)).trim() || `snapshot exited ${code}`));
        return;
      }
      const startMark = text.indexOf('TALK_JSON_START');
      const endMark = text.lastIndexOf('TALK_JSON_END');
      const body = startMark === -1
        ? text
        : text.slice(startMark + 'TALK_JSON_START'.length, endMark === -1 ? undefined : endMark);
      const json = body.trim();
      if (!json) {
        reject(new Error('snapshot did not return JSON'));
        return;
      }
      const parsed = JSON.parse(json);
      resolve((Array.isArray(parsed) ? parsed : [parsed]).map(normalizeRow));
    });
  });
}

function rememberPid(state, row, now) {
  const self = row.ancestors?.[0];
  if (!self) return state.pids[String(row.pid)] ?? null;
  state.pids[String(row.pid)] = {
    pid: row.pid,
    name: self.name,
    parentName: row.ancestors[1]?.name ?? '',
    commandLine: self.commandLine ?? '',
    lastSeen: now,
  };
  return state.pids[String(row.pid)];
}

async function nameIps(ips, state, peeks, now) {
  const names = [];
  let used = 0;
  for (const ip of ips) {
    if (isPrivateIp(ip)) continue;
    if (!state.hosts[ip] && used < peeks) {
      used += 1;
      const host = await certName(ip);
      state.hosts[ip] = { ip, host, lookedUp: now };
    }
    const cached = state.hosts[ip];
    if (cached?.host) names.push(cached.host);
  }
  return { names: [...new Set(names)], used };
}

export async function takeSample(opts) {
  if (process.platform !== 'win32') {
    throw new Error('talk samples TCP connections on Windows only');
  }
  const raw = (await snapshotWindows()).map(normalizeRow);
  const state = loadState();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const peeksBudget = opts.noCert ? 0 : opts.peeks;

  const ranked = raw
    .map((row) => ({ row, agent: isAgent(row.ancestors) }))
    .filter((x) => x.agent)
    .sort((a, b) => b.row.total - a.row.total);

  let peeksLeft = peeksBudget;
  for (const item of ranked) {
    if (peeksLeft <= 0) break;
    const ips = item.row.public443.filter((ip) => !state.hosts[ip] && !isPrivateIp(ip));
    const { used } = await nameIps(ips, state, peeksLeft, now);
    peeksLeft -= used;
  }

  const alerts = [];
  const rows = [];
  for (const row of raw) {
    rememberPid(state, row, now);
    const stored = state.pids[String(row.pid)];
    const ancestors = row.ancestors.length
      ? row.ancestors
      : (stored ? [{ name: stored.name, commandLine: stored.commandLine }] : []);
    const agent = isAgent(ancestors);
    const hostNames = [...new Set(
      row.public443
        .map((ip) => state.hosts[ip]?.host)
        .filter(Boolean),
    )];
    const prev = state.last.totals[String(row.pid)];
    const delta = prev === undefined ? null : row.total - prev;
    state.last.totals[String(row.pid)] = row.total;
    const record = {
      time: now,
      pid: row.pid,
      alive: row.alive,
      agent,
      total: row.total,
      delta,
      states: row.states ?? {},
      hosts: hostNames,
      name: ancestors[0]?.name || stored?.name || '<unknown: died before first sample>',
      parentName: ancestors[1]?.name || stored?.parentName || '',
      commandLine: ancestors[0]?.commandLine || stored?.commandLine || '',
    };
    rows.push(record);

    const cmdShort = record.commandLine.slice(0, 160);
    if (record.total >= opts.alertAt) {
      alerts.push(`PID ${record.pid} ${record.name} holds ${record.total} hosts[${record.hosts.join(' ')}] :: ${cmdShort}`);
    }
    if (agent && delta !== null && delta >= opts.climbAt) {
      alerts.push(`CLIMB PID ${record.pid} ${record.name} +${delta} now ${record.total} hosts[${record.hosts.join(' ')}]`);
    }
    if (agent) {
      for (const host of record.hosts) {
        const key = `${record.name}|${host}`;
        if (!state.seen[key]) {
          state.seen[key] = { name: record.name, host, firstSeen: now, pid: record.pid };
          alerts.push(`NEW HOST ${record.name} pid ${record.pid} -> ${host}`);
        }
      }
    }
  }

  const orphans = rows
    .filter((r) => !r.alive && r.pid !== 0)
    .reduce((sum, r) => sum + r.total, 0);
  if (state.last.orphans !== null && orphans > state.last.orphans) {
    alerts.push(`orphaned connections grew ${state.last.orphans} -> ${orphans}`);
  }
  state.last.orphans = orphans;

  for (const record of rows) appendLine(paths.samples, JSON.stringify(record));
  for (const line of alerts) appendLine(paths.alerts, `${now} ${line}`);
  saveState(state);

  const agents = rows.filter((r) => r.agent).sort((a, b) => b.total - a.total);
  saveJson(paths.latest, { time: now, conns: raw.reduce((s, r) => s + r.total, 0), orphans, agents, alerts });

  return { time: now, conns: raw.reduce((s, r) => s + r.total, 0), orphans, agents, alerts };
}
