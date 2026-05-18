import mongoose from "mongoose";
import dns from "node:dns";
import env from "./env.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Product from "../models/Item.js";
import Catalog from "../models/Catalog.js";
import User from "../models/User.js";

const safeCreateCollection = async (model) => {
  try {
    await model.createCollection();
  } catch (error) {
    if (error?.codeName !== "NamespaceExists") {
      throw error;
    }
  }
};

const maskMongoUri = (uri) => {
  if (typeof uri !== "string") {
    return "";
  }

  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/i, "$1****$3");
};

const isSrvDnsError = (error) =>
  typeof error?.code === "string" &&
  ["ECONNREFUSED", "ETIMEOUT", "ENOTFOUND", "ENODATA"].includes(error.code) &&
  typeof error?.hostname === "string" &&
  error.hostname.startsWith("_mongodb._tcp.");

const applyDnsServers = () => {
  if (!Array.isArray(env.dnsServers) || env.dnsServers.length === 0) {
    return;
  }

  try {
    dns.setServers(env.dnsServers);
  } catch (error) {
    console.warn("Unable to apply custom DNS servers:", error.message);
  }
};

const initializeCollections = async () => {
  await Promise.all([
    safeCreateCollection(User),
    safeCreateCollection(Category),
    safeCreateCollection(SubCategory),
    safeCreateCollection(Product),
    safeCreateCollection(Catalog),
  ]);
};

mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

export const connectDatabase = async () => {
  // Keep startup deterministic in production: connect DB before accepting traffic.
  mongoose.set("strictQuery", true);
  applyDnsServers();
  console.log(`Connecting to MongoDB: ${maskMongoUri(env.mongoUri)}`);

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 30000,
    });
    await initializeCollections();
    console.log(`MongoDB connected: ${maskMongoUri(env.mongoUri)}`);
    return;
  } catch (error) {
    if (!isSrvDnsError(error) || !env.mongoUriStandard) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }

    console.warn("SRV DNS lookup failed. Retrying with MONGO_URI_STANDARD...");
    await mongoose.disconnect().catch(() => {});
    await mongoose.connect(env.mongoUriStandard, {
      serverSelectionTimeoutMS: 30000,
    });
    await initializeCollections();
    console.log(`MongoDB connected: ${maskMongoUri(env.mongoUriStandard)}`);
  }
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
