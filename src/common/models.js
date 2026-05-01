export function createWebsite({ id = crypto.randomUUID(), url, label, usernameEncrypted, passwordEncrypted, order }) {
  return {
    id,
    url: sanitizeAddress(url),
    label: (label || url).trim(),
    usernameEncrypted: usernameEncrypted ?? null,
    passwordEncrypted: passwordEncrypted ?? null,
    order: order ?? Date.now()
  };
}

export function sanitizeAddress(value) {
  return value.trim();
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
