export function createWebsite({ id = crypto.randomUUID(), url, label, credentials = [] }) {
  return {
    id,
    url: sanitizeUrl(url),
    label: label.trim(),
    credentials
  };
}

export function sanitizeUrl(url) {
  const value = url.trim();
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value;
}
