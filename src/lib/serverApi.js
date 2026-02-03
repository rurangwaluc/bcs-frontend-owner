import { headers } from "next/headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

function joinUrl(base, path) {
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

// 🔥 Extract ONLY the last sid from many cookies
function extractLatestSid(cookieHeader) {
  if (!cookieHeader) return "";
  const parts = cookieHeader.split(";").map((s) => s.trim());
  const sids = parts.filter((p) => p.startsWith("sid="));
  if (!sids.length) return "";
  return sids[sids.length - 1]; // newest one
}

export async function serverApiFetch(path, options = {}) {
  const h = await headers();
  const rawCookie = h.get("cookie") || "";
  const sidOnly = extractLatestSid(rawCookie);

  const url = joinUrl(API_BASE, path);

  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      ...(options.headers || {}),
      ...(sidOnly ? { cookie: sidOnly } : {}),
      "Content-Type": "application/json",
    },
    body:
      options.body && typeof options.body === "object"
        ? JSON.stringify(options.body)
        : options.body,
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  return { ok: res.ok, status: res.status, data };
}
