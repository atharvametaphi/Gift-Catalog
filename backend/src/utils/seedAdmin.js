import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import env from "../config/env.js";
import User from "../models/User.js";
import { connectDatabase } from "../config/database.js";

const run = async () => {
  await connectDatabase();

  const email = process.env.SEED_ADMIN_EMAIL || "admin@giftcatalog.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.SEED_ADMIN_NAME || "Catalog Admin";

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists for ${email}`);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: "admin",
    status: "active",
  });

  console.log(`Seeded admin user: ${email}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Failed to seed admin:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
