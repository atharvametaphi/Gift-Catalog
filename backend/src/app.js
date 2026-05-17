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

const uploadPath = path.resolve(process.cwd(), env.uploadDir);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const exactMatch = env.corsOrigins.includes(origin);
      const localDevOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

      if (exactMatch || localDevOriginPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
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

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "gift-catalog-backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/items", itemRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
