import { Router } from "express";
import { createItem, deleteItem, getItems, updateItem } from "../controllers/catalogController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getItems);
router.post("/", protect, authorizeRoles("admin", "manager"), createItem);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateItem);
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deleteItem);

export default router;
