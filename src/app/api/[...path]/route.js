const BACKEND = "https://bcs-backend-production-8ed4.up.railway.app";

export async function GET(req, ctx) {
  return proxy(req, ctx);
}
export async function POST(req, ctx) {
  return proxy(req, ctx);
}
export async function PUT(req, ctx) {
  return proxy(req, ctx);
}
export async function PATCH(req, ctx) {
  return proxy(req, ctx);
}
export async function DELETE(req, ctx) {
  return proxy(req, ctx);
}

async function proxy(req, { params }) {
  const path = params.path.join("/");
  const url = `${BACKEND}/${path}`;

  const backendRes = await fetch(url, {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers),
      host: undefined,
    },
    body: req.body,
    redirect: "manual",
  });

  // 🔥 CRITICAL PART — FORWARD COOKIES
  const headers = new Headers(backendRes.headers);

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    headers.set("set-cookie", setCookie);
  }

  return new Response(backendRes.body, {
    status: backendRes.status,
    headers,
  });
}
