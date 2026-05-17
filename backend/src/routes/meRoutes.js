import { Router } from "express";
import { me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, me);

export default router;

