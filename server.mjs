import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const LOG_PATH = process.env.AUDIT_LOG_PATH ?? "/data/audit-log.json";
const PORT = process.env.PORT ?? 8090;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".gz": "application/gzip",
};

function readLog() {
  try {
    return fs.existsSync(LOG_PATH)
      ? JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"))
      : [];
  } catch {
    return [];
  }
}

http
  .createServer((req, res) => {
    const url = req.url.split("?")[0];

    if (req.method === "GET" && url === "/audit-log.json") {
      const data = JSON.stringify(readLog(), null, 2);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
      return;
    }

    if (req.method === "POST" && url === "/api/audit") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          const entry = JSON.parse(body);
          fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
          const log = readLog();
          log.unshift(entry);
          fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end('{"ok":true}');
        } catch {
          res.writeHead(400);
          res.end('{"error":"invalid json"}');
        }
      });
      return;
    }

    let filePath = path.join(DIST, url === "/" ? "index.html" : url);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST, "index.html");
    }
    const ext = path.extname(filePath).toLowerCase();
    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(PORT, () => console.log(`Listening on :${PORT}`));
