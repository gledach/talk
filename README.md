# talk

**Which API hosts your local coding agents connect to.**

Samples TCP connections on Windows, follows each process up to its parent, and reads the TLS certificate name of a new public endpoint once. That name is the API host. A Node helper under Cursor counts as Cursor. The URL path stays encrypted. Prompts and `Authorization` headers are never stored.

Zero runtime dependencies. No account, no build step. Everything stays on your machine.

```bash
git clone https://github.com/gledach/talk.git && cd talk
node bin/talk.mjs once
```

That works on a fresh clone with nothing installed. There is no `npm install` because there is nothing to install. Node 22 is the runtime. The sample itself runs on Windows.

The sampler is `core/win-snapshot.ps1`, in this repository, next to the rest of the program. A clone does not need a second script, a module, or an account. Samples are written to `data/` and stay out of git.

## Why

A long agent session can open connections and never close them. On Windows the default client port range is 16,384. When it fills, `curl` fails in about 20 milliseconds and tests die with `EADDRINUSE`. It looks like a dead network. If the process has already exited, the sockets stay as orphans and the owner can no longer be named.

`talk` is the record you leave running so the next one is caught while the process is still alive: who, which host, and whether the count is climbing.

## Commands

The command is `gledach-talk`. `npm link` in this clone puts that name on your PATH. Nothing named `talk` is installed: that name is an npm package and a Unix program. The package name is `gledach-talk`.

`node bin/talk.mjs` is the same program and needs no link. That is what the clone block above runs.

```bash
gledach-talk once                  # one sample
gledach-talk once --no-cert        # do not open a connection to read a certificate
gledach-talk watch                 # every 60 seconds
gledach-talk watch --interval=30 --peeks=4
gledach-talk report                # last sample
gledach-talk doctor
```

Logs go to `data/`, which is gitignored. A line is written when a process holds 500 connections or more, when an agent's count climbs by 30 in one interval, when orphaned sockets grow, or when an agent asks for a host it has not used before.

It does not close sockets and it does not restart anything. Restarting the agent releases sockets it still owns. Orphans from a dead process stay until reboot or an admin restart of `winnat`.

## What it cannot see

- A hostname that was never sent in the TLS handshake. The certificate read connects to the IP, a few times per sample, heaviest agent first. A server that will not present a name without the right hostname comes back blank.
- The path after the host (`/v1/messages` versus a telemetry route). It is encrypted, and this tool does not decrypt it. Prompts and `Authorization` headers are never stored.
- An agent that resolves names through its own encrypted DNS and never presents a certificate name.
- A process that exited before the first sample. Its sockets still count, and the owner can no longer be named.
- Anything that is not TCP. The sampler reads the Windows TCP table.
- Any operating system other than Windows. `report` can print a log you already have. `once` and `watch` cannot take a sample elsewhere.
