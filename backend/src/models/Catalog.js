import mongoose from "mongoose";

const catalogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    categoryId: {
      type: String,
      default: null,
    },
    subCategoryId: {
      type: String,
      default: null,
    },
    itemIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Catalog = mongoose.model("Catalog", catalogSchema, "catalogs");

export default Catalog;
