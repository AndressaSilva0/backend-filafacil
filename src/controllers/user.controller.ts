import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UserService } from "../services/user.service";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  unit: z.string().optional(),
  registrationNumber: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória."),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres."),
});

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const profile = await UserService.getProfile(userId);
      res.json(profile);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const updated = await UserService.updateProfile(userId, req.body);
      res.json({
        message: "Perfil atualizado com sucesso!",
        profile: updated,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await UserService.changePassword(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async uploadAvatar(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      // Se enviou arquivo via multipart/form-data
      if (req.file) {
        const fileUrl = `/uploads/avatars/${req.file.filename}`;
        const updated = await UserService.updateAvatar(userId, fileUrl);
        return res.json({
          message: "Foto de perfil atualizada com sucesso!",
          avatarUrl: updated.avatarUrl,
        });
      }

      // Se enviou url no body (ex: preset de avatar do sistema)
      const { avatarUrl } = req.body;
      if (avatarUrl) {
        const updated = await UserService.updateAvatar(userId, avatarUrl);
        return res.json({
          message: "Foto de perfil atualizada com sucesso!",
          avatarUrl: updated.avatarUrl,
        });
      }

      return res.status(400).json({ error: "Nenhum arquivo ou URL de avatar fornecido." });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

