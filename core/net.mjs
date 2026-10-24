export function isPrivateIp(ip) {
  const s = String(ip ?? '');
  return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|127\.|0\.0\.0\.0|::1$|fe80:|f[cd])/i.test(s);
}
