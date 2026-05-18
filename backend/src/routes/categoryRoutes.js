import { Router } from "express";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/catalogController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getCategories);
router.post("/", protect, authorizeRoles("admin", "manager"), createCategory);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateCategory);
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deleteCategory);

export default router;
