export async function GET(req, { params }) {
  return proxy(req, params);
}
export async function POST(req, { params }) {
  return proxy(req, params);
}
export async function PUT(req, { params }) {
  return proxy(req, params);
}
export async function PATCH(req, { params }) {
  return proxy(req, params);
}
export async function DELETE(req, { params }) {
  return proxy(req, params);
}

async function proxy(req, params) {
  const path = params.path.join("/");
  const url = `https://bcs-backend-production-8ed4.up.railway.app/${path}`;

  const res = await fetch(url, {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers),
      host: undefined,
    },
    body: req.body,
  });

  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
}
