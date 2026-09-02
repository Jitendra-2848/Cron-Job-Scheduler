import "./config/env.js";
import express from "express";
import { _init_db } from "./db/pool.js";
import router from "./routes/jobs.js";
import authRouter from "./routes/Auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Allowed Origins for CORS with credentials support (Vercel & Local)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://localhost:8000"
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, server-to-server, health checks)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      process.env.NODE_ENV !== "production"
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Safe request logging (no credentials/passwords)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// Health / root check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use("/", router);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

(async function database() {
  await _init_db();
})();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Server listening on 0.0.0.0:${PORT}`);
});
