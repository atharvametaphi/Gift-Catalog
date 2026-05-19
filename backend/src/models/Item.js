import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
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
    images: {
      type: [String],
      default: [],
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema, "products");

export default Product;
