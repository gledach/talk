import assert from 'node:assert/strict';
import { normalizeRow } from '../core/sample.mjs';
import { isAgent } from '../core/agents.mjs';

const single = normalizeRow({
  pid: 3,
  alive: true,
  total: 5,
  states: { Established: 5 },
  public443: '34.224.180.137',
  ancestors: { pid: 3, name: 'Grok Bot.exe', commandLine: 'C:\\Program Files\\Grok\\Grok Bot.exe' },
});

assert.ok(Array.isArray(single.ancestors));
assert.ok(Array.isArray(single.public443));
assert.equal(single.ancestors.length, 1);
assert.equal(isAgent(single.ancestors), true);
assert.equal(single.public443[0], '34.224.180.137');

const empty = normalizeRow({ pid: 0, alive: false, total: 12, public443: null, ancestors: null });
assert.deepEqual(empty.ancestors, []);
assert.deepEqual(empty.public443, []);
assert.equal(isAgent(empty.ancestors), false);

const many = normalizeRow({
  pid: 10,
  alive: true,
  total: 2,
  public443: ['1.1.1.1', '8.8.8.8'],
  ancestors: [
    { name: 'Cursor.exe', commandLine: 'C:\\Users\\a\\AppData\\Local\\Programs\\cursor\\Cursor.exe --type=utility' },
  ],
});
assert.equal(many.public443.length, 2);
assert.equal(isAgent(many.ancestors), true);

console.log('ok');
