import { Router } from "express";
import { createPdf, deletePdf, getPdfs } from "../controllers/pdfController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getPdfs);
router.post("/", protect, authorizeRoles("admin", "manager", "viewer"), createPdf);
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deletePdf);

export default router;

