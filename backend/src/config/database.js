import mongoose from "mongoose";
import env from "./env.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Item from "../models/Item.js";

const safeCreateCollection = async (model) => {
  try {
    await model.createCollection();
  } catch (error) {
    if (error?.codeName !== "NamespaceExists") {
      throw error;
    }
  }
};

export const connectDatabase = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
  await Promise.all([
    safeCreateCollection(Category),
    safeCreateCollection(SubCategory),
    safeCreateCollection(Item),
  ]);
  console.log(`MongoDB connected: ${env.mongodbUri}`);
};
