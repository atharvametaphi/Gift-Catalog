import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Item from "../models/Item.js";

const mapCategory = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  createdAt: doc.createdAt,
});

const mapSubCategory = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  categoryId: doc.categoryId || null,
  createdAt: doc.createdAt,
});

const mapItem = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  description: doc.description || "",
  categoryId: doc.categoryId || null,
  subCategoryId: doc.subCategoryId || null,
  images: Array.isArray(doc.images) ? doc.images : [],
  createdAt: doc.createdAt,
});

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeName = (value) => value?.trim();

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    categories: categories.map(mapCategory),
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const name = normalizeName(req.body.name);
  const selectedSubCategoryId = req.body.subCategoryId;

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  const category = await Category.create({ name });
  const categoryId = category._id.toString();

  if (selectedSubCategoryId && isObjectId(selectedSubCategoryId)) {
    const subCategory = await SubCategory.findById(selectedSubCategoryId);
    if (subCategory) {
      subCategory.categoryId = categoryId;
      await subCategory.save();
      await Item.updateMany(
        { subCategoryId: subCategory._id.toString() },
        { $set: { categoryId } },
      );
    }
  }

  return res.status(201).json({
    category: mapCategory(category),
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = normalizeName(req.body.name);
  const selectedSubCategoryId = req.body.subCategoryId;

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid category id." });
  }

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  category.name = name;
  await category.save();

  if (selectedSubCategoryId && isObjectId(selectedSubCategoryId)) {
    const subCategory = await SubCategory.findById(selectedSubCategoryId);
    if (subCategory) {
      subCategory.categoryId = category._id.toString();
      await subCategory.save();
      await Item.updateMany(
        { subCategoryId: subCategory._id.toString() },
        { $set: { categoryId: category._id.toString() } },
      );
    }
  }

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
  await SubCategory.updateMany(
    { categoryId: id },
    { $set: { categoryId: null } },
  );
  await Item.updateMany(
    { categoryId: id },
    { $set: { categoryId: null } },
  );

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
  const selectedItemId = req.body.itemId;
  const selectedCategoryId = req.body.categoryId || null;

  if (!name) {
    return res.status(400).json({ message: "Sub-Category name is required." });
  }

  let linkedItem = null;
  if (selectedItemId && isObjectId(selectedItemId)) {
    linkedItem = await Item.findById(selectedItemId);
  }

  const categoryId = linkedItem?.categoryId || selectedCategoryId;
  const subCategory = await SubCategory.create({
    name,
    categoryId: categoryId || null,
  });

  if (linkedItem) {
    linkedItem.subCategoryId = subCategory._id.toString();
    if (categoryId) {
      linkedItem.categoryId = categoryId;
    }
    await linkedItem.save();
  }

  return res.status(201).json({
    subCategory: mapSubCategory(subCategory),
  });
});

export const updateSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = normalizeName(req.body.name);
  const selectedItemId = req.body.itemId;

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid sub-category id." });
  }

  if (!name) {
    return res.status(400).json({ message: "Sub-Category name is required." });
  }

  const subCategory = await SubCategory.findById(id);
  if (!subCategory) {
    return res.status(404).json({ message: "Sub-Category not found." });
  }

  subCategory.name = name;
  await subCategory.save();

  if (selectedItemId && isObjectId(selectedItemId)) {
    const linkedItem = await Item.findById(selectedItemId);
    if (linkedItem) {
      linkedItem.subCategoryId = subCategory._id.toString();
      if (!subCategory.categoryId && linkedItem.categoryId) {
        subCategory.categoryId = linkedItem.categoryId;
        await subCategory.save();
      }
      if (subCategory.categoryId) {
        linkedItem.categoryId = subCategory.categoryId;
      }
      await linkedItem.save();
    }
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
  await Item.updateMany(
    { subCategoryId: id },
    { $set: { subCategoryId: null } },
  );

  return res.status(200).json({ message: "Sub-Category deleted successfully." });
});

export const getItems = asyncHandler(async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    items: items.map(mapItem),
  });
});

export const createItem = asyncHandler(async (req, res) => {
  const name = normalizeName(req.body.name);
  const description = normalizeName(req.body.description) || "";
  const images = Array.isArray(req.body.images) ? req.body.images.filter((entry) => typeof entry === "string" && entry.trim()) : [];
  const requestedCategoryId = normalizeName(req.body.categoryId);
  const requestedSubCategoryId = normalizeName(req.body.subCategoryId);

  if (!name) {
    return res.status(400).json({ message: "Item name is required." });
  }

  if (images.length === 0) {
    return res.status(400).json({ message: "At least one item image is required." });
  }

  if (!requestedCategoryId) {
    return res.status(400).json({ message: "Category selection is required." });
  }

  if (!requestedSubCategoryId) {
    return res.status(400).json({ message: "Sub-category selection is required." });
  }

  const item = await Item.create({
    name,
    description,
    categoryId: requestedCategoryId,
    subCategoryId: requestedSubCategoryId,
    images,
  });

  return res.status(201).json({
    item: mapItem(item),
  });
});

export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = normalizeName(req.body.name);
  const description = normalizeName(req.body.description) || "";
  const images = Array.isArray(req.body.images) ? req.body.images.filter((entry) => typeof entry === "string" && entry.trim()) : [];
  const requestedCategoryId = normalizeName(req.body.categoryId);
  const requestedSubCategoryId = normalizeName(req.body.subCategoryId);

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid item id." });
  }

  if (!name) {
    return res.status(400).json({ message: "Item name is required." });
  }

  if (images.length === 0) {
    return res.status(400).json({ message: "At least one item image is required." });
  }

  if (!requestedCategoryId) {
    return res.status(400).json({ message: "Category selection is required." });
  }

  if (!requestedSubCategoryId) {
    return res.status(400).json({ message: "Sub-category selection is required." });
  }

  const item = await Item.findById(id);
  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  item.name = name;
  item.description = description;
  item.categoryId = requestedCategoryId;
  item.subCategoryId = requestedSubCategoryId;
  item.images = images;
  await item.save();

  return res.status(200).json({
    item: mapItem(item),
  });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isObjectId(id)) {
    return res.status(400).json({ message: "Invalid item id." });
  }

  const item = await Item.findById(id);
  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  await item.deleteOne();
  return res.status(200).json({ message: "Item deleted successfully." });
});
