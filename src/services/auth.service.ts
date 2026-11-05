import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { generateToken } from "../config/jwt";
import { isValidCPF, cleanCPF, formatCPF } from "../utils/cpf";
import { Role } from "@prisma/client";

export class AuthService {
  static async register(data: {
    name: string;
    cpf: string;
    email: string;
    password: string;
    role?: string;
    unit?: string;
    phone?: string;
    registrationNumber?: string;
    acceptedTerms?: boolean;
  }) {
    const rawCpf = cleanCPF(data.cpf);

    if (!isValidCPF(rawCpf)) {
      throw new Error("CPF informado é inválido segundo a Receita Federal.");
    }

    if (!data.acceptedTerms) {
      throw new Error("É obrigatório o aceite dos Termos de Privacidade e Sigilo do SUS.");
    }

    const formattedCpf = formatCPF(rawCpf);

    // Verifica se já existe usuário com este e-mail ou CPF
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email.toLowerCase().trim() }, { cpf: formattedCpf }],
      },
    });

    if (existing) {
      if (existing.email.toLowerCase() === data.email.toLowerCase().trim()) {
        throw new Error("Já existe um operador cadastrado com este e-mail.");
      }
      throw new Error("Já existe um operador cadastrado com este CPF.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Mapeia role
    let userRole: Role = Role.RECEPCIONISTA;
    const roleInput = (data.role || "").toUpperCase();
    if (roleInput.includes("MEDIC")) userRole = Role.MEDICO;
    else if (roleInput.includes("ENFERM")) userRole = Role.ENFERMEIRO;
    else if (roleInput.includes("TEC")) userRole = Role.TEC_ENFERMAGEM;
    else if (roleInput.includes("DENT")) userRole = Role.DENTISTA;
    else if (roleInput.includes("COORD")) userRole = Role.COORDENADOR;
    else if (roleInput.includes("ACS")) userRole = Role.ACS;
    else if (roleInput.includes("ADMIN")) userRole = Role.ADMIN;

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        cpf: formattedCpf,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        role: userRole,
        unit: data.unit || "UBS Centro - Dr. José Silva",
        phone: data.phone,
        registrationNumber: data.registrationNumber,
        acceptedTerms: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        role: true,
        unit: true,
        phone: true,
        registrationNumber: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      cpf: user.cpf,
      role: user.role,
      name: user.name,
    });

    return { user, token };
  }

  static async login(data: {
    identifier?: string;
    cpf?: string;
    email?: string;
    password: string;
    rememberMe?: boolean;
  }) {
    const term = (data.identifier || data.cpf || data.email || "").trim();

    if (!term) {
      throw new Error("Informe seu CPF ou E-mail para acessar.");
    }

    const isEmail = term.includes("@");
    let user;

    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: term.toLowerCase() },
      });
    } else {
      const cleaned = cleanCPF(term);
      const formatted = formatCPF(cleaned);
      user = await prisma.user.findFirst({
        where: {
          OR: [{ cpf: formatted }, { cpf: cleaned }],
        },
      });
    }

    if (!user) {
      throw new Error("Credenciais inválidas. Verifique os dados informados.");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error("Credenciais inválidas. Verifique os dados informados.");
    }

    const token = generateToken(
      {
        userId: user.id,
        email: user.email,
        cpf: user.cpf,
        role: user.role,
        name: user.name,
      },
      Boolean(data.rememberMe)
    );

    const { password: _, resetPasswordToken: __, resetPasswordExpires: ___, ...userProfile } = user;

    return {
      user: userProfile,
      token,
    };
  }

  static async forgotPassword(identifier: string) {
    const term = identifier.trim();
    const isEmail = term.includes("@");

    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: term.toLowerCase() },
      });
    } else {
      const cleaned = cleanCPF(term);
      const formatted = formatCPF(cleaned);
      user = await prisma.user.findFirst({
        where: {
          OR: [{ cpf: formatted }, { cpf: cleaned }],
        },
      });
    }

    if (!user) {
      // Por segurança, retorna mensagem de sucesso simulada para não enumerar emails
      return {
        message: "Se o e-mail ou CPF estiver cadastrado, as instruções de redefinição foram enviadas.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expires,
      },
    });

    return {
      message: "Instruções de redefinição de senha geradas com sucesso.",
      resetToken, // Retornado para facilitar testes no frontend
      email: user.email,
    };
  }

  static async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new Error("Token e nova senha são obrigatórios.");
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error("Token de redefinição inválido ou expirado.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: "Senha redefinida com sucesso! Você já pode efetuar o login." };
  }
}
