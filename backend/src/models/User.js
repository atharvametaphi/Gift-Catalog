import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "viewer",
      enum: ["admin", "manager", "viewer"],
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema, "users");

export default User;
