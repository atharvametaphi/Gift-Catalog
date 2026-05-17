import mongoose from "mongoose";
import dns from "node:dns";
import env from "./env.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Item from "../models/Item.js";
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
    safeCreateCollection(Item),
  ]);
};

export const connectDatabase = async () => {
  mongoose.set("strictQuery", true);
  applyDnsServers();

  try {
    await mongoose.connect(env.mongodbUri);
    await initializeCollections();
    console.log(`MongoDB connected: ${maskMongoUri(env.mongodbUri)}`);
    return;
  } catch (error) {
    if (!isSrvDnsError(error) || !env.mongodbUriStandard) {
      throw error;
    }

    console.warn("SRV DNS lookup failed. Retrying with MONGODB_URI_STANDARD...");
    await mongoose.disconnect().catch(() => {});
    await mongoose.connect(env.mongodbUriStandard);
    await initializeCollections();
    console.log(`MongoDB connected: ${maskMongoUri(env.mongodbUriStandard)}`);
  }
};
