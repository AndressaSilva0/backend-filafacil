import { prisma } from "../config/prisma";
import { ServiceType } from "@prisma/client";
import { resolveServiceType } from "../utils/ticketCode";

export class RoomService {
  static async listRooms() {
    return prisma.room.findMany({
      orderBy: { name: "asc" },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  static async getRoomById(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        assignedUser: true,
      },
    });

    if (!room) {
      throw new Error("Sala não encontrada.");
    }

    return room;
  }

  static async createRoom(data: {
    name: string;
    label?: string;
    defaultService?: string;
    assignedProfessional?: string;
    assignedUserId?: string;
  }) {
    const { service } = resolveServiceType(data.defaultService);

    return prisma.room.create({
      data: {
        name: data.name.trim(),
        label: data.label || data.name,
        defaultService: service,
        assignedProfessional: data.assignedProfessional,
        assignedUserId: data.assignedUserId,
      },
    });
  }

  static async updateRoom(
    id: string,
    data: {
      name?: string;
      label?: string;
      defaultService?: string;
      assignedProfessional?: string;
      assignedUserId?: string | null;
    }
  ) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.label !== undefined) updateData.label = data.label;
    if (data.defaultService !== undefined) {
      const { service } = resolveServiceType(data.defaultService);
      updateData.defaultService = service;
    }
    if (data.assignedProfessional !== undefined) {
      updateData.assignedProfessional = data.assignedProfessional;
    }
    if (data.assignedUserId !== undefined) {
      updateData.assignedUserId = data.assignedUserId;
    }

    return prisma.room.update({
      where: { id },
      data: updateData,
    });
  }

  static async assignProfessional(
    roomId: string,
    userId: string,
    professionalName?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Operador não encontrado.");
    }

    const nameToAssign = professionalName || user.name;

    const room = await prisma.room.update({
      where: { id: roomId },
      data: {
        assignedUserId: user.id,
        assignedProfessional: nameToAssign,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return room;
  }
}

