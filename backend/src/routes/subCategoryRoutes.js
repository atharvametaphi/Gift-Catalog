import { Router } from "express";
import { createSubCategory, deleteSubCategory, getSubCategories, updateSubCategory } from "../controllers/catalogController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getSubCategories);
router.post("/", protect, authorizeRoles("admin", "manager"), createSubCategory);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateSubCategory);
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deleteSubCategory);

export default router;
