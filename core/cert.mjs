import tls from 'node:tls';

/** Certificate CN for a public IP. One extra connection. No HTTP, no stored key. */
export function certName(ip, timeoutMs = 2000) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      resolve(value || '');
    };
    const sock = tls.connect({
      host: ip,
      port: 443,
      rejectUnauthorized: false,
      timeout: timeoutMs,
    }, () => {
      const cert = sock.getPeerCertificate();
      sock.end();
      finish(cert?.subject?.CN || '');
    });
    sock.on('timeout', () => {
      sock.destroy();
      finish('');
    });
    sock.on('error', () => finish(''));
  });
}
