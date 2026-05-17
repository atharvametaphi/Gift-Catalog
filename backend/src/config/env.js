import dotenv from "dotenv";

dotenv.config();

// Production deployment contract for Render.
// Keep these variable names aligned with Render environment settings.
const requiredVars = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const normalizeCsv = (value) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  // Render injects PORT at runtime. Fallback keeps local development simple.
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  mongoUriStandard: process.env.MONGO_URI_STANDARD || "",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrls: normalizeCsv(process.env.CLIENT_URL),
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  dnsServers: normalizeCsv(process.env.DNS_SERVERS || "1.1.1.1,8.8.8.8"),
};

if (!Number.isFinite(env.port) || env.port <= 0) {
  throw new Error("Invalid PORT value.");
}

if (env.clientUrls.length === 0) {
  throw new Error("CLIENT_URL must contain at least one origin.");
}

export default env;
