import dotenv from "dotenv";

const dotenvResult = dotenv.config();

const normalizeCsv = (value) =>
  (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const firstDefined = (...values) =>
  values.find((value) => typeof value === "string" && value.trim().length > 0) || "";

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  // Render injects PORT at runtime. Fallback keeps local development simple.
  port: Number(process.env.PORT) || 5000,
  // Primary production variable is MONGO_URI.
  // MONGODB_URI is supported only as a non-breaking fallback.
  mongoUri: firstDefined(process.env.MONGO_URI, process.env.MONGODB_URI),
  mongoUriStandard: process.env.MONGO_URI_STANDARD || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // Primary production variable is CLIENT_URL.
  // CORS_ORIGIN is supported only as a non-breaking fallback.
  clientUrls: normalizeCsv(firstDefined(process.env.CLIENT_URL, process.env.CORS_ORIGIN)),
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  dnsServers: normalizeCsv(process.env.DNS_SERVERS || "1.1.1.1,8.8.8.8"),
};

export const validateEnv = () => {
  const problems = [];

  if (!Number.isFinite(env.port) || env.port <= 0) {
    problems.push("PORT must be a positive number.");
  }

  if (!env.mongoUri) {
    problems.push("MONGO_URI is required.");
  }

  if (!env.jwtSecret) {
    problems.push("JWT_SECRET is required.");
  }

  if (env.clientUrls.length === 0) {
    problems.push("CLIENT_URL must contain at least one allowed frontend origin.");
  }

  if (problems.length > 0) {
    throw new Error(`Invalid environment configuration: ${problems.join(" ")}`);
  }
};

export const envLoadMeta = {
  source: dotenvResult.error ? "process-environment" : ".env + process-environment",
};

export default env;
