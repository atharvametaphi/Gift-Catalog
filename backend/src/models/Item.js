import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    categoryId: {
      type: String,
      default: null,
    },
    subCategoryId: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Item = mongoose.model("Item", itemSchema, "items");

export default Item;
