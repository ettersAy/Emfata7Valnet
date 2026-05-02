/**
 * CSV utility functions for import/export of vault data.
 * Extracted from options-main.js to follow SRP.
 */

/**
 * Serialize websites array to CSV string.
 * @param {Array} websites
 * @returns {string}
 */
export function websitesToCsv(websites) {
  const header = "id,url,label,credentials,order";
  const rows = websites.map((w) => {
    const credsJson = (w.credentials || []).length > 0
      ? JSON.stringify(w.credentials.map(c => ({
          id: c.id,
          loginEncrypted: c.loginEncrypted || null,
          passwordEncrypted: c.passwordEncrypted || null
        })))
      : "";
    return [w.id, escapeCsv(w.url), escapeCsv(w.label), escapeCsv(credsJson), w.order || 0].join(",");
  });
  return [header, ...rows].join("\n");
}

/**
 * Parse CSV string into websites array.
 * @param {string} csv
 * @returns {Array}
 */
export function csvToWebsites(csv) {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  const rows = lines.slice(1);

  return rows.map((line) => {
    const values = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (values[i] || "").trim();
    });

    let credentials = [];
    if (obj.credentials) {
      try {
        const parsed = JSON.parse(unescapeCsv(obj.credentials));
        if (Array.isArray(parsed)) {
          credentials = parsed.map(c => ({
            id: c.id,
            loginEncrypted: c.loginEncrypted || null,
            passwordEncrypted: c.passwordEncrypted || null
          }));
        }
      } catch {
        // Attempt to parse old format (single credential)
        if (obj.usernameEncrypted || obj.passwordEncrypted) {
          let loginEncrypted = null;
          let passwordEncrypted = null;
          if (obj.usernameEncrypted && obj.usernameEncrypted.includes(":")) {
            const [iv, val] = obj.usernameEncrypted.split(":");
            loginEncrypted = { iv, value: val };
          }
          if (obj.passwordEncrypted && obj.passwordEncrypted.includes(":")) {
            const [iv, val] = obj.passwordEncrypted.split(":");
            passwordEncrypted = { iv, value: val };
          }
          credentials = [{ id: crypto.randomUUID(), loginEncrypted, passwordEncrypted }];
        }
      }
    }

    return {
      id: obj.id,
      url: unescapeCsv(obj.url || ""),
      label: unescapeCsv(obj.label || obj.url || ""),
      credentials,
      order: parseInt(obj.order, 10) || Date.now()
    };
  });
}

function escapeCsv(val) {
  if (!val) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function unescapeCsv(val) {
  if (!val) return "";
  let s = val;
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).replace(/""/g, '"');
  }
  return s;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}
