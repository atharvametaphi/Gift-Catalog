import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";

const normalizeRole = (value) => String(value || "").trim().toLowerCase();

export const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. Missing bearer token." });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Not authorized. User not found." });
    }

    if (user.status === "inactive") {
      return res.status(403).json({ message: "User account is inactive." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized. Invalid token." });
  }
};

export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized." });
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    const allowed = allowedRoles.map(normalizeRole);

    if (!allowed.includes(normalizeRole(req.user.role))) {
      return res.status(403).json({ message: "Access denied for your role." });
    }

    return next();
  };
