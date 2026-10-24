export default async function help() {
  console.log(`talk — which API hosts your local coding agents connect to

  node bin/talk.mjs once                 one sample
  node bin/talk.mjs once --no-cert       skip the certificate read
  node bin/talk.mjs watch                every minute, until you stop it
  node bin/talk.mjs watch --interval=30
  node bin/talk.mjs report               last sample
  node bin/talk.mjs doctor

Read-only. It does not close a socket, kill a process, or store a prompt.
The certificate name is the API host. The path after it stays encrypted.
Logs stay in ./data and are gitignored.

Windows only. The sampler is core/win-snapshot.ps1 inside this clone.
A fresh clone needs Node 22 and nothing else.`);
  return 0;
}
