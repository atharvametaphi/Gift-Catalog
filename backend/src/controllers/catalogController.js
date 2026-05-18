import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Product from "../models/Item.js";
import Catalog from "../models/Catalog.js";

const mapCategory = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  description: doc.description || "",
  status: doc.status || "active",
  createdAt: doc.createdAt,
});

const mapSubCategory = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  categoryId: doc.categoryId || null,
  description: doc.description || "",
  status: doc.status || "active",
  createdAt: doc.createdAt,
});

const mapProduct = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  description: doc.description || "",
  status: doc.status || "active",
  categoryId: doc.categoryId || null,
  subCategoryId: doc.subCategoryId || null,
  images: Array.isArray(doc.images) ? doc.images : [],
  createdAt: doc.createdAt,
});

const mapCatalog = (doc) => ({
  id: doc._id.toString(),
  name: doc.name || "",
  description: doc.description || "",
  status: doc.status || "active",
  categoryId: doc.categoryId || null,
  subCategoryId: doc.subCategoryId || null,
  itemIds: Array.isArray(doc.itemIds) ? doc.itemIds : [],
  createdAt: doc.createdAt,
});

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeName = (value) => value?.trim();
const normalizeStatus = (value) => String(value || "").trim().toLowerCase();

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    categories: categories.map(mapCategory),
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const name = normalizeName(req.body.name);
  const description = normalizeName(req.body.description) || "";
  const status = normalizeStatus(req.body.status);

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive." });
  }

  const category = await Category.create({ name, description, status });

  return res.status(201).json({
    category: mapCategory(category),
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = normalizeName(req.body.name);
  const description = normalizeName(req.body.description) || "";
  const status = normalizeStatus(req.body.status);

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid category id." });
  }

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive." });
  }

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  category.name = name;
  category.description = description;
  category.status = status;
  await category.save();

  return res.status(200).json({
    category: mapCategory(category),
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid category id." });
  }

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  await category.deleteOne();
  await SubCategory.updateMany({ categoryId: id }, { $set: { categoryId: null } });
  await Product.updateMany({ categoryId: id }, { $set: { categoryId: null } });

  return res.status(200).json({ message: "Category deleted successfully." });
});

export const getSubCategories = asyncHandler(async (req, res) => {
  const subCategories = await SubCategory.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    subCategories: subCategories.map(mapSubCategory),
  });
});

export const createSubCategory = asyncHandler(async (req, res) => {
  const name = normalizeName(req.body.name);
  const categoryId = normalizeName(req.body.categoryId) || null;
  const description = normalizeName(req.body.description) || "";
  const status = normalizeStatus(req.body.status);

  if (!name) {
    return res.status(400).json({ message: "Sub-Category name is required." });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive." });
  }

  if (categoryId && !isObjectId(categoryId)) {
    return res.status(400).json({ message: "Invalid category id." });
  }

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
  }

  const subCategory = await SubCategory.create({
    name,
    categoryId,
    description,
    status,
  });

  return res.status(201).json({
    subCategory: mapSubCategory(subCategory),
  });
});

export const updateSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = normalizeName(req.body.name);
  const categoryId = normalizeName(req.body.categoryId) || null;
  const description = normalizeName(req.body.description) || "";
  const status = normalizeStatus(req.body.status);

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid sub-category id." });
  }

  if (!name) {
    return res.status(400).json({ message: "Sub-Category name is required." });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive." });
  }

  if (categoryId && !isObjectId(categoryId)) {
    return res.status(400).json({ message: "Invalid category id." });
  }

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
  }

  const subCategory = await SubCategory.findById(id);
  if (!subCategory) {
    return res.status(404).json({ message: "Sub-Category not found." });
  }

  subCategory.name = name;
  subCategory.categoryId = categoryId;
  subCategory.description = description;
  subCategory.status = status;
  await subCategory.save();

  if (!categoryId) {
    await Product.updateMany({ subCategoryId: id }, { $set: { categoryId: null } });
  }

  return res.status(200).json({
    subCategory: mapSubCategory(subCategory),
  });
});

export const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid sub-category id." });
  }

  const subCategory = await SubCategory.findById(id);
  if (!subCategory) {
    return res.status(404).json({ message: "Sub-Category not found." });
  }

  await subCategory.deleteOne();
  await Product.updateMany({ subCategoryId: id }, { $set: { subCategoryId: null } });

  return res.status(200).json({ message: "Sub-Category deleted successfully." });
});

export const getItems = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    items: products.map(mapProduct),
    products: products.map(mapProduct),
  });
});

export const createItem = asyncHandler(async (req, res) => {
  const name = normalizeName(req.body.name);
  const description = normalizeName(req.body.description) || "";
  const status = normalizeStatus(req.body.status);
  const images = Array.isArray(req.body.images) ? req.body.images.filter((entry) => typeof entry === "string" && entry.trim()) : [];
  const requestedCategoryId = normalizeName(req.body.categoryId) || null;
  const requestedSubCategoryId = normalizeName(req.body.subCategoryId) || null;

  if (!name) {
    return res.status(400).json({ message: "Product name is required." });
  }

  if (images.length === 0) {
    return res.status(400).json({ message: "At least one item image is required." });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive." });
  }

  if (requestedCategoryId && !isObjectId(requestedCategoryId)) {
    return res.status(400).json({ message: "Invalid category id." });
  }

  if (requestedSubCategoryId && !isObjectId(requestedSubCategoryId)) {
    return res.status(400).json({ message: "Invalid sub-category id." });
  }

  let resolvedCategoryId = requestedCategoryId;
  let subCategory = null;

  if (resolvedCategoryId) {
    const category = await Category.findById(resolvedCategoryId).lean();
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
  }

  if (requestedSubCategoryId) {
    subCategory = await SubCategory.findById(requestedSubCategoryId).lean();
    if (!subCategory) {
      return res.status(404).json({ message: "Sub-Category not found." });
    }

    if (resolvedCategoryId && subCategory.categoryId && subCategory.categoryId !== resolvedCategoryId) {
      return res.status(400).json({ message: "Sub-Category does not belong to the selected category." });
    }

    if (!resolvedCategoryId) {
      resolvedCategoryId = subCategory.categoryId || null;
    }
  }

  const product = await Product.create({
    name,
    description,
    status,
    categoryId: resolvedCategoryId,
    subCategoryId: requestedSubCategoryId,
    images,
  });

  return res.status(201).json({
    item: mapProduct(product),
    product: mapProduct(product),
  });
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = normalizeName(req.body.name);
  const description = normalizeName(req.body.description) || "";
  const status = normalizeStatus(req.body.status);
  const images = Array.isArray(req.body.images) ? req.body.images.filter((entry) => typeof entry === "string" && entry.trim()) : [];
  const requestedCategoryId = normalizeName(req.body.categoryId) || null;
  const requestedSubCategoryId = normalizeName(req.body.subCategoryId) || null;

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid item id." });
  }

  if (!name) {
    return res.status(400).json({ message: "Product name is required." });
  }

  if (images.length === 0) {
    return res.status(400).json({ message: "At least one item image is required." });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive." });
  }

  if (requestedCategoryId && !isObjectId(requestedCategoryId)) {
    return res.status(400).json({ message: "Invalid category id." });
  }

  if (requestedSubCategoryId && !isObjectId(requestedSubCategoryId)) {
    return res.status(400).json({ message: "Invalid sub-category id." });
  }

  let resolvedCategoryId = requestedCategoryId;

  if (resolvedCategoryId) {
    const category = await Category.findById(resolvedCategoryId).lean();
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
  }

  if (requestedSubCategoryId) {
    const subCategory = await SubCategory.findById(requestedSubCategoryId).lean();
    if (!subCategory) {
      return res.status(404).json({ message: "Sub-Category not found." });
    }

    if (resolvedCategoryId && subCategory.categoryId && subCategory.categoryId !== resolvedCategoryId) {
      return res.status(400).json({ message: "Sub-Category does not belong to the selected category." });
    }

    if (!resolvedCategoryId) {
      resolvedCategoryId = subCategory.categoryId || null;
    }
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  product.name = name;
  product.description = description;
  product.status = status;
  product.categoryId = resolvedCategoryId;
  product.subCategoryId = requestedSubCategoryId;
  product.images = images;
  await product.save();

  return res.status(200).json({
    item: mapProduct(product),
    product: mapProduct(product),
  });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid item id." });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  await product.deleteOne();
  await Catalog.updateMany({ itemIds: id }, { $pull: { itemIds: id } });
  return res.status(200).json({ message: "Product deleted successfully." });
});

export const getCatalogs = asyncHandler(async (req, res) => {
  const catalogs = await Catalog.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    catalogs: catalogs.map(mapCatalog),
  });
});

export const createCatalog = asyncHandler(async (req, res) => {
  const categoryId = normalizeName(req.body.categoryId);
  const subCategoryId = normalizeName(req.body.subCategoryId);
  const description = normalizeName(req.body.description) || "";
  const status = normalizeStatus(req.body.status || "active");
  const providedItemIds = Array.isArray(req.body.itemIds)
    ? req.body.itemIds.filter((itemId) => typeof itemId === "string" && itemId.trim())
    : [];

  if (!categoryId) {
    return res.status(400).json({ message: "Category selection is required." });
  }

  if (!subCategoryId) {
    return res.status(400).json({ message: "Sub-Category selection is required." });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive." });
  }

  if (!isObjectId(categoryId) || !isObjectId(subCategoryId)) {
    return res.status(400).json({ message: "Invalid category or sub-category id." });
  }

  const [category, subCategory] = await Promise.all([
    Category.findById(categoryId).lean(),
    SubCategory.findById(subCategoryId).lean(),
  ]);

  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  if (!subCategory) {
    return res.status(404).json({ message: "Sub-Category not found." });
  }

  if (subCategory.categoryId && subCategory.categoryId !== categoryId) {
    return res.status(400).json({ message: "Sub-Category does not belong to the selected category." });
  }

  let itemIds = providedItemIds;

  if (itemIds.length === 0) {
    const matchingItems = await Product.find({
      categoryId,
      subCategoryId,
    })
      .select("_id")
      .lean();
    itemIds = matchingItems.map((product) => product._id.toString());
  }

  if (itemIds.length === 0) {
    return res.status(400).json({ message: "No products found for the selected category and sub-category." });
  }

  const catalog = await Catalog.create({
    name: `${category.name} - ${subCategory.name}`,
    description,
    status,
    categoryId,
    subCategoryId,
    itemIds,
  });

  return res.status(201).json({
    catalog: mapCatalog(catalog),
  });
});

export const updateCatalog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const categoryId = normalizeName(req.body.categoryId);
  const subCategoryId = normalizeName(req.body.subCategoryId);
  const description = normalizeName(req.body.description) || "";
  const status = normalizeStatus(req.body.status || "active");
  const providedItemIds = Array.isArray(req.body.itemIds)
    ? req.body.itemIds.filter((itemId) => typeof itemId === "string" && itemId.trim())
    : [];

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid catalog id." });
  }

  if (!categoryId) {
    return res.status(400).json({ message: "Category selection is required." });
  }

  if (!subCategoryId) {
    return res.status(400).json({ message: "Sub-Category selection is required." });
  }

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive." });
  }

  if (!isObjectId(categoryId) || !isObjectId(subCategoryId)) {
    return res.status(400).json({ message: "Invalid category or sub-category id." });
  }

  const catalog = await Catalog.findById(id);
  if (!catalog) {
    return res.status(404).json({ message: "Catalog not found." });
  }

  const [category, subCategory] = await Promise.all([
    Category.findById(categoryId).lean(),
    SubCategory.findById(subCategoryId).lean(),
  ]);

  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  if (!subCategory) {
    return res.status(404).json({ message: "Sub-Category not found." });
  }

  if (subCategory.categoryId && subCategory.categoryId !== categoryId) {
    return res.status(400).json({ message: "Sub-Category does not belong to the selected category." });
  }

  let itemIds = providedItemIds;

  if (itemIds.length === 0) {
    const matchingItems = await Product.find({
      categoryId,
      subCategoryId,
    })
      .select("_id")
      .lean();
    itemIds = matchingItems.map((product) => product._id.toString());
  }

  if (itemIds.length === 0) {
    return res.status(400).json({ message: "No products found for the selected category and sub-category." });
  }

  catalog.name = `${category.name} - ${subCategory.name}`;
  catalog.description = description;
  catalog.status = status;
  catalog.categoryId = categoryId;
  catalog.subCategoryId = subCategoryId;
  catalog.itemIds = itemIds;
  await catalog.save();

  return res.status(200).json({
    catalog: mapCatalog(catalog),
  });
});
