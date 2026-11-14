
import { Router } from "express";
import {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);

// Password recovery routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
