export function createWebsite({ id = crypto.randomUUID(), url, label, credentials, order }) {
  return {
    id,
    url: sanitizeAddress(url),
    label: (label || url).trim(),
    credentials: (credentials || []).map(c => ({
      id: c.id || crypto.randomUUID(),
      loginEncrypted: c.loginEncrypted ?? null,
      passwordEncrypted: c.passwordEncrypted ?? null
    })),
    order: order ?? Date.now()
  };
}

export function createCredential({ id = crypto.randomUUID(), loginEncrypted, passwordEncrypted }) {
  return {
    id,
    loginEncrypted: loginEncrypted ?? null,
    passwordEncrypted: passwordEncrypted ?? null
  };
}

export function sanitizeAddress(value) {
  return value.trim();
}

/**
 * Extract a concise hostname for display (max 20 chars).
 */
export function getDisplayUrl(url) {
  try {
    const urlStr = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const parsed = new URL(urlStr);
    let hostname = parsed.hostname.replace(/^www\./, '');
    if (hostname.length > 20) {
      hostname = hostname.slice(0, 17) + '...';
    }
    return hostname;
  } catch {
    // Not a URL — just truncate
    return url.length > 20 ? url.slice(0, 17) + '...' : url;
  }
}

export function normalizeUrlForOpen(raw) {
  const value = raw.trim();
  if (!value) return null;

  const candidates = /^https?:\/\//i.test(value) ? [value] : [`https://${value}`, `http://${value}`];
  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.toString();
      }
    } catch {
      // continue
    }
  }

  return null;
}
