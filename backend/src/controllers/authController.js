import bcrypt from "bcryptjs";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Only admin access is allowed." });
  }

  const token = generateToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = req.user;

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

