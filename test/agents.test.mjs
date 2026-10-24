import assert from 'node:assert/strict';
import { isAgent } from '../core/agents.mjs';
import { isPrivateIp } from '../core/net.mjs';

const cursorHelper = [
  {
    pid: 10,
    name: 'Cursor.exe',
    commandLine: 'C:\\Users\\a\\AppData\\Local\\Programs\\cursor\\Cursor.exe --type=utility --utility-sub-type=node.mojom.NodeService',
  },
  { pid: 9, name: 'Cursor.exe', commandLine: 'C:\\Users\\a\\AppData\\Local\\Programs\\cursor\\Cursor.exe' },
];

const vscodeHelper = [
  {
    pid: 10,
    name: 'Code.exe',
    commandLine: 'C:\\Program Files\\Microsoft VS Code\\Code.exe --type=utility --utility-sub-type=node.mojom.NodeService',
  },
  { pid: 9, name: 'Code.exe', commandLine: 'C:\\Program Files\\Microsoft VS Code\\Code.exe' },
];

const grok = [
  { pid: 3, name: 'Grok Bot.exe', commandLine: 'C:\\Program Files\\Grok\\Grok Bot.exe' },
];

assert.equal(isAgent(cursorHelper), true);
assert.equal(isAgent(vscodeHelper), false);
assert.equal(isAgent(grok), true);
assert.equal(isAgent([]), false);
assert.equal(isPrivateIp('192.168.178.40'), true);
assert.equal(isPrivateIp('34.224.180.137'), false);

console.log('ok');
