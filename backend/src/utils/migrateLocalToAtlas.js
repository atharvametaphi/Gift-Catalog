import dns from "node:dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const COLLECTIONS = ["users", "categories", "subcategories", "items"];

const localUri = process.env.LOCAL_MONGODB_URI || "mongodb://localhost:27017/GiftCatalog";
const atlasUri = process.env.ATLAS_MONGODB_URI || process.env.MONGO_URI || "";
const atlasUriStandard = process.env.ATLAS_MONGODB_URI_STANDARD || process.env.MONGO_URI_STANDARD || "";
const dnsServers = String(process.env.DNS_SERVERS || "1.1.1.1,8.8.8.8")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

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
  if (dnsServers.length === 0) {
    return;
  }

  try {
    dns.setServers(dnsServers);
  } catch (error) {
    console.warn("Unable to apply custom DNS servers:", error.message);
  }
};

const createConnection = async (uri, label) => {
  if (!uri) {
    throw new Error(`Missing URI for ${label}`);
  }

  const connection = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 20000,
  });
  await connection.asPromise();
  return connection;
};

const connectAtlas = async () => {
  applyDnsServers();

  try {
    const connection = await createConnection(atlasUri, "Atlas");
    return { connection, usedUri: atlasUri };
  } catch (error) {
    if (!isSrvDnsError(error) || !atlasUriStandard) {
      throw error;
    }

    console.warn("SRV DNS lookup failed for Atlas. Retrying with ATLAS_MONGODB_URI_STANDARD...");
    const connection = await createConnection(atlasUriStandard, "Atlas (standard URI)");
    return { connection, usedUri: atlasUriStandard };
  }
};

const run = async () => {
  let localConn = null;
  let atlasConn = null;
  let atlasConnectedUri = "";

  try {
    localConn = await createConnection(localUri, "Local MongoDB");
    const atlasResult = await connectAtlas();
    atlasConn = atlasResult.connection;
    atlasConnectedUri = atlasResult.usedUri;

    console.log(`Local DB connected: ${maskMongoUri(localUri)}`);
    console.log(`Atlas DB connected: ${maskMongoUri(atlasConnectedUri)}`);

    for (const collectionName of COLLECTIONS) {
      const sourceCollection = localConn.db.collection(collectionName);
      const targetCollection = atlasConn.db.collection(collectionName);

      const sourceDocs = await sourceCollection.find({}).toArray();
      if (sourceDocs.length === 0) {
        console.log(`[${collectionName}] local empty, skipped`);
        continue;
      }

      const operations = sourceDocs.map((doc) => ({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true,
        },
      }));

      const result = await targetCollection.bulkWrite(operations, { ordered: false });
      const atlasCount = await targetCollection.countDocuments();

      console.log(
        `[${collectionName}] copied=${sourceDocs.length}, inserted=${result.upsertedCount || 0}, modified=${result.modifiedCount || 0}, atlasTotal=${atlasCount}`,
      );
    }

    console.log("Local to Atlas migration completed.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    if (localConn) {
      await localConn.close().catch(() => {});
    }
    if (atlasConn) {
      await atlasConn.close().catch(() => {});
    }
  }
};

run();
