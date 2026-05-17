import { Router } from "express";
import { createItem, deleteItem, getItems, updateItem } from "../controllers/catalogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getItems);
router.post("/", protect, createItem);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

export default router;
