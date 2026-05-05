import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

export function auditPlugin(): Plugin {
  const logPath = path.join(process.cwd(), "public", "audit-log.json");

  return {
    name: "audit-server",
    configureServer(server) {
      server.middlewares.use("/api/audit", (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405);
          res.end();
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const entry = JSON.parse(body);
            const existing: unknown[] = fs.existsSync(logPath)
              ? JSON.parse(fs.readFileSync(logPath, "utf-8"))
              : [];
            existing.unshift(entry);
            fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end('{"ok":true}');
          } catch {
            res.writeHead(400);
            res.end('{"error":"invalid json"}');
          }
        });
      });
    },
  };
}
