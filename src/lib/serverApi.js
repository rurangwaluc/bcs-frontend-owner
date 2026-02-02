import { cookies, headers } from "next/headers";

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

function hasBody(options) {
  return Object.prototype.hasOwnProperty.call(options || {}, "body");
}

function isFormData(v) {
  return typeof FormData !== "undefined" && v instanceof FormData;
}

export async function serverApiFetch(path, options = {}) {
  // ✅ Correct way in Next 16
  const cookieStore = await cookies();
  const h = await headers();
  const cookie = cookieStore.toString() || h.get("cookie") || "";

  const url = joinUrl(API_BASE, path);

  const opts = { ...options };
  const reqHeaders = { ...(opts.headers || {}) };

  if (cookie) reqHeaders.cookie = cookie;

  let body = undefined;

  if (hasBody(opts)) {
    const b = opts.body;

    if (b === undefined || b === null) {
      body = undefined;
    } else if (typeof b === "string" || b instanceof Uint8Array) {
      body = b;
    } else if (isFormData(b)) {
      body = b;
    } else if (typeof b === "object") {
      body = JSON.stringify(b);
      reqHeaders["Content-Type"] = "application/json";
    } else {
      body = JSON.stringify(b);
      reqHeaders["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers: reqHeaders,
    body,
    cache: opts.cache || "no-store",
  });

  const text = await res.text();
  const data = parseMaybeJson(text);

  return { ok: res.ok, status: res.status, data };
}

export async function serverApiFetchOrThrow(path, options = {}) {
  const out = await serverApiFetch(path, options);
  if (!out.ok) {
    const err = new Error(out.data?.error || "Request failed");
    err.status = out.status;
    err.data = out.data;
    throw err;
  }
  return out.data;
}
