// Always use Next.js proxy. Never call Railway directly from browser.
const API_BASE = "/api";

function joinUrl(base, path) {
  const p = String(path || "");
  if (!p) return base;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${base}${p}`;
  return `${base}/${p}`;
}

function parseMaybeJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function isFormData(v) {
  return typeof FormData !== "undefined" && v instanceof FormData;
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function ensureJsonString(str) {
  const s = String(str);
  JSON.parse(s);
  return s;
}

export async function apiFetch(path, options = {}) {
  const url = joinUrl(API_BASE, path);

  const opts = { ...options };
  const headers = { ...(opts.headers || {}) };

  let body = undefined;

  if (hasOwn(opts, "body")) {
    const b = opts.body;

    if (b === undefined || b === null || b === "") {
      body = undefined;
    } else if (isFormData(b)) {
      body = b;
    } else if (typeof b === "string") {
      body = ensureJsonString(b);
      headers["Content-Type"] = "application/json";
    } else if (typeof b === "object") {
      body = JSON.stringify(b);
      headers["Content-Type"] = "application/json";
    } else {
      body = JSON.stringify(b);
      headers["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body,
    credentials: "include", // critical for cookies
    cache: opts.cache || "no-store",
  });

  const text = await res.text();
  const data = parseMaybeJson(text);

  if (!res.ok) {
    const err = new Error((data && data.error) || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
