import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";

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

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized. Invalid token." });
  }
};

