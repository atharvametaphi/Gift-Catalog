import { Router } from "express";
import { createUser, deleteUser, getUsers, updateUser, updateUserRole } from "../controllers/userController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorizeRoles("admin"));
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/role", updateUserRole);

export default router;
