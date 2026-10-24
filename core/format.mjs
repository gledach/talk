export function printSample(sample, top) {
  console.log('');
  console.log(`== ${sample.time}  conns ${sample.conns}  orphaned ${sample.orphans}  agents ${sample.agents.length}`);
  for (const line of sample.alerts) console.log(`ALERT  ${line}`);
  const rows = sample.agents.slice(0, top);
  if (rows.length === 0) {
    console.log('(no tagged agent owns a TCP connection this sample)');
    return;
  }
  const head = ['Pid', 'Alive', 'Total', 'Delta', 'Name', 'Parent', 'Hosts'];
  const body = rows.map((r) => [
    String(r.pid),
    String(r.alive),
    String(r.total),
    r.delta === null ? '' : String(r.delta),
    r.name,
    r.parentName,
    r.hosts.join(' '),
  ]);
  const widths = head.map((h, i) => Math.max(h.length, ...body.map((row) => row[i].length)));
  const line = (cols) => cols.map((c, i) => c.padEnd(widths[i])).join('  ');
  console.log(line(head));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of body) console.log(line(row));
}
