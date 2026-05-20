import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/database.js";

const PRESERVED_COLLECTIONS = new Set(["users"]);

const clearCollections = async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  const names = collections.map((collection) => collection.name).sort();

  if (names.length === 0) {
    console.log("No collections found.");
    return;
  }

  console.log(`Found collections: ${names.join(", ")}`);

  for (const name of names) {
    if (PRESERVED_COLLECTIONS.has(name)) {
      continue;
    }

    const result = await mongoose.connection.db.collection(name).deleteMany({});
    console.log(`Cleared ${name}: deleted ${result.deletedCount} document(s).`);
  }

  const userCount = await mongoose.connection.db.collection("users").countDocuments();
  console.log(`Preserved users collection: ${userCount} document(s).`);
};

const run = async () => {
  try {
    await connectDatabase();
    await clearCollections();
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Failed to clear non-user collections:", error.message);
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  }
};

run();

