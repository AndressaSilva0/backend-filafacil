import { Router } from "express";
import {
  AuthController,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validation.middleware";

const router = Router();

router.post("/register", validateBody(registerSchema), AuthController.register);
router.post("/login", validateBody(loginSchema), AuthController.login);
router.post("/forgot-password", validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), AuthController.resetPassword);

export default router;

