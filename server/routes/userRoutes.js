import { Router } from "express";
import { publicProfile, updateMe } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
const router = Router();
router.get("/:id", publicProfile);
router.put("/me", protect, updateMe);
export default router;