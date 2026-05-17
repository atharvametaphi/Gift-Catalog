import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    categoryId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const SubCategory = mongoose.model("SubCategory", subCategorySchema, "subcategories");

export default SubCategory;
