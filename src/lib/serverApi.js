export async function serverApiFetch(path, options = {}) {
  const h = await headers();
  const cookie = h.get("cookie") || "";

  const fullPath = `/api${path.startsWith("/") ? path : `/${path}`}`;
  const url = joinUrl(API_BASE, fullPath);

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
