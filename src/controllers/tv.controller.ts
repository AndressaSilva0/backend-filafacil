import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { QueueStatus, Priority } from "@prisma/client";

export class TVController {
  /**
   * Obtém a última senha chamada ativa (caso a TV seja recarregada)
   */
  static async getCurrentCall(_req: Request, res: Response) {
    try {
      const activeCall = await prisma.ticket.findFirst({
        where: {
          status: {
            in: [QueueStatus.CHAMANDO, QueueStatus.EM_ATENDIMENTO],
          },
        },
        orderBy: {
          calledAt: "desc",
        },
        include: {
          roomRel: true,
        },
      });

      if (!activeCall) {
        return res.json({
          hasCall: false,
          currentCall: null,
        });
      }

      const isPref =
        activeCall.priority === Priority.PREFERENCIAL ||
        (activeCall.priorityLabel || "").toLowerCase().includes("pref") ||
        (activeCall.priorityLabel || "").toLowerCase().includes("80") ||
        (activeCall.priorityLabel || "").toLowerCase().includes("gest");

      const isUrg = activeCall.priority === Priority.URGENTE;

      res.json({
        hasCall: true,
        currentCall: {
          code: activeCall.code,
          priorityType: isUrg ? "urgente" : isPref ? "preferencial" : "normal",
          priorityLabel: activeCall.priorityLabel || "Atendimento Convencional (Normal)",
          room: activeCall.room || "Consultório Médico",
          patientName: activeCall.patientName,
          specialty: activeCall.serviceLabel || "Atendimento Clínico",
          doctor: activeCall.professional || "Profissional de Saúde",
          calledAt: activeCall.calledAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Lista as próximas senhas previstas com estimativa de horário
   */
  static async getUpcomingTickets(_req: Request, res: Response) {
    try {
      const waiting = await prisma.ticket.findMany({
        where: {
          status: QueueStatus.AGUARDANDO,
        },
        orderBy: [
          { priorityWeight: "desc" },
          { createdAt: "asc" },
        ],
        take: 10,
      });

      const now = new Date();
      let accumulatedMinutes = 5;

      const upcoming = waiting.map((t, index) => {
        const estTime = new Date(now.getTime() + accumulatedMinutes * 60000);
        accumulatedMinutes += 12; // Média de 12 min por consulta

        const isPref = t.priority === Priority.PREFERENCIAL;
        const isUrg = t.priority === Priority.URGENTE;

        return {
          code: t.code,
          priorityType: isUrg ? "urgente" : isPref ? "preferencial" : "normal",
          priorityLabel: t.priorityLabel || (isPref ? "PREFERENCIAL" : "NORMAL"),
          name: t.patientName,
          details: `${t.serviceLabel || "Clínico Geral"} • ${t.room || "Consultório"}`,
          estimatedTime: isUrg
            ? "Imediato"
            : `Previsto: ${estTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        };
      });

      res.json(upcoming);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

