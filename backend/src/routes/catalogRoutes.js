import { Router } from "express";
import { createCatalog, getCatalogs, updateCatalog } from "../controllers/catalogController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getCatalogs);
router.post("/", protect, authorizeRoles("admin", "manager"), createCatalog);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateCatalog);

export default router;
