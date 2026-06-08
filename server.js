const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function safeStaticPath(urlPath) {
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const resolved = path.resolve(root, `.${decodeURIComponent(requested)}`);
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

async function handleRpc(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const target = new URL(body.url);
    if (target.protocol !== "https:") {
      send(res, 400, JSON.stringify({ error: "Only https RPC endpoints are allowed" }));
      return;
    }
    const upstream = await fetch(target.toString(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body.payload),
    });
    const text = await upstream.text();
    send(res, upstream.ok ? 200 : upstream.status, text);
  } catch (error) {
    send(res, 500, JSON.stringify({ error: error.message }));
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }

  if (req.url === "/rpc" && req.method === "POST") {
    await handleRpc(req, res);
    return;
  }

  if (req.method !== "GET") {
    send(res, 405, JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const filePath = safeStaticPath(new URL(req.url, `http://localhost:${port}`).pathname);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
    return;
  }

  const type = contentTypes[path.extname(filePath)] || "application/octet-stream";
  send(res, 200, fs.readFileSync(filePath), type);
});

server.listen(port, () => {
  console.log(`Solana RPC Scout running at http://localhost:${port}`);
});
