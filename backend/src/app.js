import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/authRoutes.js";
import meRoutes from "./routes/meRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import env from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const API_PREFIX = "/api";

const uploadPath = path.resolve(process.cwd(), env.uploadDir);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Render runs behind a proxy; trust it for correct IP/rate-limit behavior.
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const exactMatch = env.clientUrls.includes(origin);

      if (exactMatch) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(`/${env.uploadDir}`, express.static(uploadPath));

// Render health check endpoint.
app.get("/", (req, res) => {
  res.status(200).send("Backend Running");
});

app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "gift-catalog-backend",
    timestamp: new Date().toISOString(),
  });
});

// Keep all business routes under a single /api prefix.
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/me`, meRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/subcategories`, subCategoryRoutes);
app.use(`${API_PREFIX}/items`, itemRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
