import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const allowedRoles = ["admin", "manager", "viewer"];
const allowedStatuses = ["active", "inactive"];

const normalizeText = (value) => String(value || "").trim();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const normalizeRole = (value) => normalizeText(value).toLowerCase();
const normalizeStatus = (value) => normalizeText(value).toLowerCase();

const mapUser = (doc) => ({
  id: doc._id.toString(),
  name: doc.name || "",
  email: doc.email || "",
  role: doc.role || "",
  status: doc.status || "active",
  createdAt: doc.createdAt,
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("name email role status createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    users: users.map(mapUser),
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const name = normalizeText(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const role = normalizeRole(req.body.role || "viewer");
  const status = normalizeStatus(req.body.status || "active");

  if (!name) {
    return res.status(400).json({ message: "User name is required." });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Role must be admin, manager, or viewer." });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Status must be active or inactive." });
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return res.status(409).json({ message: "A user with this email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    status,
  });

  return res.status(201).json({
    user: mapUser(createdUser),
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = normalizeRole(req.body.role);

  if (!id) {
    return res.status(400).json({ message: "User id is required." });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Role must be admin, manager, or viewer." });
  }

  if (req.user?._id?.toString() === id) {
    return res.status(400).json({ message: "You cannot change your own role." });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.role = role;
  await user.save();

  return res.status(200).json({
    user: mapUser(user),
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const name = normalizeText(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const role = normalizeRole(req.body.role);
  const status = normalizeStatus(req.body.status);

  if (!id) {
    return res.status(400).json({ message: "User id is required." });
  }

  if (!name) {
    return res.status(400).json({ message: "User name is required." });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Role must be admin, manager, or viewer." });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Status must be active or inactive." });
  }

  if (password && password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const duplicateEmailUser = await User.findOne({ email });
  if (duplicateEmailUser && duplicateEmailUser._id.toString() !== id) {
    return res.status(409).json({ message: "A user with this email already exists." });
  }

  user.name = name;
  user.email = email;
  user.role = role;
  user.status = status;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();

  return res.status(200).json({
    user: mapUser(user),
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "User id is required." });
  }

  if (req.user?._id?.toString() === id) {
    return res.status(400).json({ message: "You cannot delete your own account." });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  await user.deleteOne();

  return res.status(200).json({ message: "User deleted successfully." });
});
