import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["MONGODB_URI", "JWT_SECRET", "PORT", "CORS_ORIGIN"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const normalizeOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT),
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigins: normalizeOrigins(process.env.CORS_ORIGIN),
  uploadDir: process.env.UPLOAD_DIR || "uploads",
};

if (!Number.isFinite(env.port)) {
  throw new Error("Missing or invalid environment variable: PORT");
}

export default env;