import { Router } from "express";
import {
  UserController,
  updateProfileSchema,
  changePasswordSchema,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { uploadAvatar } from "../middlewares/upload.middleware";

const router = Router();

// Todas as rotas de perfil exigem autenticação Bearer Token
router.use(authMiddleware as any);

router.get("/profile", UserController.getProfile as any);
router.put("/profile", validateBody(updateProfileSchema), UserController.updateProfile as any);
router.put("/change-password", validateBody(changePasswordSchema), UserController.changePassword as any);
router.post("/avatar", uploadAvatar.single("avatar"), UserController.uploadAvatar as any);

export default router;

