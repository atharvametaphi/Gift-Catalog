import { Router } from "express";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/catalogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getCategories);
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
