/**
 * Browser-trust fence for the MathLab routes.
 *
 * Behaviorally identical to the harness `/api` gateway fence: the request Host
 * must be loopback or a deployment-trusted authority, and a browser-attached
 * Origin must name the same hostname. This is a DNS-rebinding / cross-site
 * defense, not authentication: the page itself is already authenticated by the
 * harness, and these routes only answer that page.
 */

/** @param {string} hostname */
function isLoopbackHostname(hostname) {
  if (hostname === 'localhost' || hostname === '[::1]') return true;
  const parts = hostname.split('.');
  return parts.length === 4
    && parts[0] === '127'
    && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

/** @param {string} authority */
function parseAuthority(authority) {
  try {
    return new URL(`http://${authority}`);
  } catch {
    return undefined;
  }
}

/** Canonical `host[:port]` for one trustedHosts entry. */
function canonicalAuthority(entry, entryUrl) {
  const port = entryUrl.port !== '' ? entryUrl.port : new URL(`https://${entry}`).port;
  return port === '' ? entryUrl.hostname : `${entryUrl.hostname}:${port}`;
}

/** @param {URL} hostUrl @param {readonly string[]} trustedHosts */
function isTrustedAuthority(hostUrl, trustedHosts) {
  return trustedHosts.some((entry) => {
    const entryUrl = parseAuthority(entry);
    if (entryUrl === undefined) return false;
    return canonicalAuthority(entry, entryUrl) === entryUrl.hostname
      ? entryUrl.hostname === hostUrl.hostname
      : entryUrl.host === hostUrl.host;
  });
}

/**
 * Decide whether one MathLab request may reach the plugin route.
 * @param {{ headers: Record<string, string | string[] | undefined> }} request
 * @param {readonly string[]} trustedHosts
 * @returns {boolean}
 */
export function isTrustedApiRequest(request, trustedHosts) {
  const header = (name) => {
    const value = request.headers[name];
    return typeof value === 'string' ? value : undefined;
  };
  const host = header('host');
  if (host === undefined) return false;
  const hostUrl = parseAuthority(host);
  if (hostUrl === undefined) return false;
  if (!isLoopbackHostname(hostUrl.hostname) && !isTrustedAuthority(hostUrl, trustedHosts)) return false;
  if (header('sec-fetch-site') === 'cross-site') return false;
  const origin = header('origin');
  if (origin === undefined) return true;
  try {
    return new URL(origin).hostname === hostUrl.hostname;
  } catch {
    return false;
  }
}
