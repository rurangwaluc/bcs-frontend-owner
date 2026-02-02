const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:4000";

function normalizeBase(base) {
  const b = String(base || "").trim();
  if (!b) return "http://localhost:4000";
  return b.endsWith("/") ? b.slice(0, -1) : b;
}

const API_BASE = normalizeBase(RAW_API_BASE);

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

// If someone passes a string while claiming JSON, validate it's JSON.
function ensureJsonString(str) {
  const s = String(str);
  JSON.parse(s); // throws if invalid
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
      // DO NOT set Content-Type; fetch will add boundary
    } else if (typeof b === "string") {
      // If caller passed string, only set JSON header if it's valid JSON
      body = ensureJsonString(b);
      headers["Content-Type"] = "application/json";
    } else if (typeof b === "object") {
      // Plain object -> JSON stringify
      body = JSON.stringify(b);
      headers["Content-Type"] = "application/json";
    } else {
      // numbers/booleans -> stringify
      body = JSON.stringify(b);
      headers["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body,
    credentials: "include",
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
