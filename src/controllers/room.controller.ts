import { Request, Response } from "express";
import { z } from "zod";
import { RoomService } from "../services/room.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const roomSchema = z.object({
  name: z.string().min(1, "O nome da sala é obrigatório."),
  label: z.string().optional(),
  defaultService: z.string().optional(),
  assignedProfessional: z.string().optional(),
  assignedUserId: z.string().optional(),
});

export class RoomController {
  static async listRooms(_req: Request, res: Response) {
    try {
      const rooms = await RoomService.listRooms();
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getRoomById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const room = await RoomService.getRoomById(id);
      res.json(room);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createRoom(req: Request, res: Response) {
    try {
      const room = await RoomService.createRoom(req.body);
      res.status(201).json({
        message: "Sala cadastrada com sucesso!",
        room,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateRoom(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const room = await RoomService.updateRoom(id, req.body);
      res.json({
        message: "Sala atualizada com sucesso!",
        room,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async assignProfessional(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const userId = req.body.userId || req.user?.userId;

      if (!userId) {
        return res.status(400).json({ error: "ID do profissional/operador é obrigatório." });
      }

      const professionalName = req.body.professionalName || req.user?.name;
      const room = await RoomService.assignProfessional(id, userId, professionalName);

      res.json({
        message: `Profissional ${room.assignedProfessional} vinculado à sala ${room.name}!`,
        room,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
