import { Router } from "express";
import { createSubCategory, deleteSubCategory, getSubCategories, updateSubCategory } from "../controllers/catalogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getSubCategories);
router.post("/", protect, createSubCategory);
router.put("/:id", protect, updateSubCategory);
router.delete("/:id", protect, deleteSubCategory);

export default router;
