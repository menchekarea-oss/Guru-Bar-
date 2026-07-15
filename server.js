const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const billsDir = path.join(root, "bills");
const port = Number(process.env.PORT || 8080);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function safeName(value) {
  return String(value || "bill").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function saveBill(req, res) {
  try {
    const payload = JSON.parse(await readBody(req));
    fs.mkdirSync(billsDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const billNo = safeName(payload.bill?.billNo || payload.billNo);
    const base = `${billNo}-${stamp}`;
    const htmlPath = path.join(billsDir, `${base}.html`);
    const jsonPath = path.join(billsDir, `${base}.json`);
    fs.writeFileSync(htmlPath, payload.receiptHtml || "", "utf8");
    fs.writeFileSync(jsonPath, JSON.stringify(payload.bill || payload, null, 2), "utf8");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, htmlPath, jsonPath }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: error.message }));
  }
}

async function saveReport(req, res) {
  try {
    const payload = JSON.parse(await readBody(req));
    fs.mkdirSync(billsDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportNo = safeName(payload.report?.reportNo || payload.reportNo || "daily-sales-report");
    const base = `${reportNo}-${stamp}`;
    const htmlPath = path.join(billsDir, `${base}.html`);
    const jsonPath = path.join(billsDir, `${base}.json`);
    fs.writeFileSync(htmlPath, payload.reportHtml || "", "utf8");
    fs.writeFileSync(jsonPath, JSON.stringify(payload.report || payload, null, 2), "utf8");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, htmlPath, jsonPath }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: error.message }));
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/save-bill") {
    saveBill(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/save-report") {
    saveReport(req, res);
    return;
  }

  const requestUrl = new URL(req.url, `http://localhost:${port}`);
  const pathname = decodeURIComponent(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
  const filePath = path.resolve(root, `.${pathname}`);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Hotel Guru billing app running at http://127.0.0.1:${port}`);
  console.log(`Bills will be saved in ${billsDir}`);
});
