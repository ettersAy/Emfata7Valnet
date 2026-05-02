/**
 * Detect whether a value looks like a URL (has a domain-like pattern)
 * vs a plain text label (app name, note, etc.).
 */
export function isUrl(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  // Strip protocol prefix for detection
  const clean = trimmed.replace(/^https?:\/\//i, "").replace(/^www\./i, "");

  // Must contain at least one dot + something resembling a TLD (min 2 chars)
  const dotSepPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?){1,}$/i;
  // Also check for IP addresses
  const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?(\/|$)/;

  return dotSepPattern.test(clean) || ipPattern.test(clean) || /^https?:\/\//i.test(trimmed);
}

/**
 * Detect the entry type based on the URL value.
 * Returns "url" for web addresses, "text" for plain labels (apps, notes).
 */
export function detectType(value) {
  return isUrl(value) ? "url" : "text";
}

export function createWebsite({ id = crypto.randomUUID(), url, label, credentials, order, type }) {
  return {
    id,
    url: sanitizeAddress(url),
    label: (label || url).trim(),
    type: type || detectType(url),
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
