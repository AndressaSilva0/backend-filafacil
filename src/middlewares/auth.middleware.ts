import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../config/jwt";
import { prisma } from "../config/prisma";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    unit?: string | null;
    registrationNumber?: string | null;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticação não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        role: true,
        unit: true,
        registrationNumber: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado ou inativo." });
    }

    req.user = {
      userId: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      role: user.role,
      unit: user.unit,
      registrationNumber: user.registrationNumber,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token de autenticação inválido ou expirado." });
  }
}

export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        role: true,
        unit: true,
        registrationNumber: true,
      },
    });

    if (user) {
      req.user = {
        userId: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        role: user.role,
        unit: user.unit,
        registrationNumber: user.registrationNumber,
      };
    }
  } catch {
    // Se falhar o token opcional, segue adiante sem req.user
  }

  next();
}

