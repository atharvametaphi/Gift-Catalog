import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";

const run = async () => {
  try {
    await connectDatabase();
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map((entry) => entry.name).sort();
    console.log("Collections available:", names.join(", "));
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to create/verify collections:", error.message);
    process.exit(1);
  }
};

run();
