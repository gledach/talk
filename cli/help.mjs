export default async function help() {
  console.log(`gledach-talk. which API hosts your local coding agents connect to

  gledach-talk once                 one sample
  gledach-talk once --no-cert       skip the certificate read
  gledach-talk watch                every minute, until you stop it
  gledach-talk watch --interval=30
  gledach-talk report               last sample
  gledach-talk doctor

Same program, with nothing on your PATH: node bin/talk.mjs once
Nothing named talk is installed. npm link installs gledach-talk.

Read-only. It does not close a socket, kill a process, or store a prompt.
The certificate name is the API host. The path after it stays encrypted.
Logs stay in ./data and are gitignored.

Windows only. The sampler is core/win-snapshot.ps1 inside this clone.
A fresh clone needs Node 22 and nothing else.`);
  return 0;
}
