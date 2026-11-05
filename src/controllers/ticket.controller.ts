import { Request, Response } from "express";
import { z } from "zod";
import { TicketService } from "../services/ticket.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createTicketSchema = z.object({
  patientId: z.string().optional(),
  patientName: z.string().min(2, "Nome do paciente é obrigatório.").optional(),
  name: z.string().optional(), // alias para patientName
  cpf: z.string().optional(),
  cartaoSus: z.string().optional(),
  susCard: z.string().optional(), // alias
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  priority: z.string().optional(),
  specialCondition: z.string().optional(),
  service: z.string().optional(),
  serviceType: z.string().optional(), // alias
  notes: z.string().optional(),
  roomId: z.string().optional(),
  room: z.string().optional(),
  date: z.string().optional(),
  selectedDate: z.string().optional(),
  scheduledDate: z.string().optional(),
  time: z.string().optional(),
  selectedTime: z.string().optional(),
  scheduledTime: z.string().optional(),
});

export class TicketController {
  static async createTicket(req: Request, res: Response) {
    try {
      const body = req.body;
      const data = {
        patientId: body.patientId,
        patientName: body.patientName || body.name,
        cpf: body.cpf,
        cartaoSus: body.cartaoSus || body.susCard,
        birthDate: body.birthDate,
        phone: body.phone,
        priority: body.priority,
        specialCondition: body.specialCondition,
        service: body.service || body.serviceType,
        notes: body.notes,
        roomId: body.roomId,
        room: body.room,
        date: body.date,
        selectedDate: body.selectedDate,
        scheduledDate: body.scheduledDate,
        time: body.time,
        selectedTime: body.selectedTime,
        scheduledTime: body.scheduledTime,
      };

      const result = await TicketService.createTicket(data);
      res.status(201).json({
        message: `Senha ${result.ticket.code} emitida com sucesso!`,
        ticket: result.ticket,
        receipt: result.receipt,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async listTickets(req: Request, res: Response) {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const specialty = req.query.specialty ? String(req.query.specialty) : undefined;
      const room = req.query.room ? String(req.query.room) : undefined;
      const doctor = req.query.doctor ? String(req.query.doctor) : undefined;
      const priority = req.query.priority ? String(req.query.priority) : undefined;
      const date = req.query.date ? String(req.query.date) : undefined;
      const search = req.query.search || req.query.q ? String(req.query.search || req.query.q) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 25;

      const data = await TicketService.listTickets({
        status,
        specialty,
        room,
        doctor,
        priority,
        date,
        search,
        page,
        limit,
      });

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getWaitingQueue(_req: Request, res: Response) {
    try {
      const waiting = await TicketService.getWaitingQueue();
      res.json(waiting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async callTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params.id);
      const { roomId, roomName, professionalName } = req.body;

      const called = await TicketService.callTicket({
        ticketId: id,
        roomId,
        roomName,
        professionalName: professionalName || req.user?.name,
        userId: req.user?.userId,
      });

      res.json({
        message: `Senha ${called.code} chamada para ${called.room}!`,
        ticket: called,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async callNext(req: AuthenticatedRequest, res: Response) {
    try {
      const { roomId, roomName, professionalName } = req.body;

      const called = await TicketService.callTicket({
        roomId,
        roomName,
        professionalName: professionalName || req.user?.name,
        userId: req.user?.userId,
      });

      res.json({
        message: `Próximo paciente chamado: Senha ${called.code}!`,
        ticket: called,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async recallTicket(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const recalled = await TicketService.recallTicket(id);
      res.json({
        message: `Senha ${recalled.code} rechamada no painel!`,
        ticket: recalled,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async startAttendance(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const updated = await TicketService.startAttendance(id);
      res.json({
        message: `Atendimento da senha ${updated.code} iniciado!`,
        ticket: updated,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async finishAttendance(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { cid, notes } = req.body;
      const updated = await TicketService.finishAttendance(id, { cid, notes });
      res.json({
        message: `Atendimento da senha ${updated.code} finalizado com sucesso!`,
        ticket: updated,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async markAbsent(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const updated = await TicketService.markAbsent(id);
      res.json({
        message: `Senha ${updated.code} marcada como AUSENTE.`,
        ticket: updated,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async exportTickets(req: Request, res: Response) {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;
      const specialty = req.query.specialty ? String(req.query.specialty) : undefined;
      const date = req.query.date ? String(req.query.date) : undefined;

      const csv = await TicketService.exportTicketsToCsv({ status, specialty, date });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="filafacil-fila-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
