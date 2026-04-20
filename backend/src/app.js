import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../uploads");
const frontendDistDir = path.resolve(__dirname, "../../dist");

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.use("/uploads", express.static(uploadsDir));
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use("/api", apiRouter);

  if (fs.existsSync(frontendDistDir)) {
    app.use(express.static(frontendDistDir));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        return next();
      }

      return res.sendFile(path.join(frontendDistDir, "index.html"));
    });
  }

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      message: error?.message ?? "Unknown server error",
    });
  });

  return app;
}
