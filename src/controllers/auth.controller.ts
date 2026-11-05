import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";

export const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  cpf: z.string().min(11, "O CPF deve ser informado."),
  email: z.string().email("E-mail com formato inválido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  role: z.string().optional(),
  unit: z.string().optional(),
  phone: z.string().optional(),
  registrationNumber: z.string().optional(),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "É necessário aceitar os termos do SUS.",
  }),
});

export const loginSchema = z.object({
  login: z.string().optional(),
  identifier: z.string().optional(),
  cpf: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1, "A senha deve ser preenchida."),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Informe seu e-mail corporativo ou CPF."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token de redefinição obrigatório."),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres."),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        message: "Operador cadastrado com sucesso!",
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.json({
        message: "Login efetuado com sucesso!",
        ...result,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { identifier } = req.body;
      const result = await AuthService.forgotPassword(identifier);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

