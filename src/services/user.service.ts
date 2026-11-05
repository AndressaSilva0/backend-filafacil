import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { Role } from "@prisma/client";

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        cpf: true,
        email: true,
        role: true,
        unit: true,
        phone: true,
        registrationNumber: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("Operador não encontrado.");
    }

    return user;
  }

  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      role?: string;
      unit?: string;
      registrationNumber?: string;
      avatarUrl?: string;
    }
  ) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    if (data.role) {
      const roleUpper = data.role.toUpperCase();
      if (roleUpper.includes("MEDIC")) updateData.role = Role.MEDICO;
      else if (roleUpper.includes("ENFERM")) updateData.role = Role.ENFERMEIRO;
      else if (roleUpper.includes("TEC")) updateData.role = Role.TEC_ENFERMAGEM;
      else if (roleUpper.includes("DENT")) updateData.role = Role.DENTISTA;
      else if (roleUpper.includes("COORD")) updateData.role = Role.COORDENADOR;
      else if (roleUpper.includes("ACS")) updateData.role = Role.ACS;
      else if (roleUpper.includes("ADMIN")) updateData.role = Role.ADMIN;
      else if (roleUpper.includes("RECEP")) updateData.role = Role.RECEPCIONISTA;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        cpf: true,
        email: true,
        role: true,
        unit: true,
        phone: true,
        registrationNumber: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  static async changePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Operador não encontrado.");
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new Error("A senha atual informada está incorreta.");
    }

    const hashed = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: "Senha alterada com sucesso!" };
  }

  static async updateAvatar(userId: string, avatarUrl: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    return updated;
  }
}

