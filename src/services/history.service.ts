import { prisma } from "../config/prisma";
import { QueueStatus } from "@prisma/client";
import { cleanCPF } from "../utils/cpf";
import { resolveServiceType } from "../utils/ticketCode";
import { parseFlexibleDate } from "../utils/date";
import { toCsvString } from "../utils/csvExport";

export class HistoryService {
  /**
   * Consulta Retroativa do Histórico Clínico
   */
  static async listHistory(params: {
    date?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    specialty?: string;
    room?: string;
    doctor?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: {
        in: [QueueStatus.FINALIZADO, QueueStatus.AUSENTE],
      },
    };

    // Filtro por status
    if (params.status && params.status !== "ALL") {
      const s = params.status.toUpperCase();
      if (s.includes("ATEND")) where.status = QueueStatus.FINALIZADO;
      else if (s.includes("AUSENT")) where.status = QueueStatus.AUSENTE;
    }

    // Filtro por período relativo (hoje | semana | mes) ou data específica / intervalo
    if (params.period && params.period !== "ALL") {
      const p = params.period.toLowerCase();
      const now = new Date();
      if (p === "hoje" || p === "today") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        where.createdAt = { gte: start, lte: end };
      } else if (p === "semana" || p === "week") {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        where.createdAt = { gte: start };
      } else if (p === "mes" || p === "month") {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        where.createdAt = { gte: start };
      }
    } else if (params.date) {
      const parsedDate = parseFlexibleDate(params.date);
      if (parsedDate) {
        const start = new Date(parsedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(parsedDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt = { gte: start, lte: end };
      }
    } else if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        const parsedStart = parseFlexibleDate(params.startDate);
        if (parsedStart) where.createdAt.gte = parsedStart;
      }
      if (params.endDate) {
        const parsedEnd = parseFlexibleDate(params.endDate);
        if (parsedEnd) {
          parsedEnd.setHours(23, 59, 59, 999);
          where.createdAt.lte = parsedEnd;
        }
      }
    }

    // Filtro por especialidade
    if (params.specialty && params.specialty !== "ALL") {
      const { service } = resolveServiceType(params.specialty);
      where.service = service;
    }

    // Filtro por sala
    if (params.room && params.room !== "ALL") {
      where.room = { contains: params.room, mode: "insensitive" };
    }

    // Filtro por profissional
    if (params.doctor && params.doctor !== "ALL") {
      where.professional = { contains: params.doctor, mode: "insensitive" };
    }

    // Busca por nome, CPF, código de senha ou profissional
    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      const digits = cleanCPF(term);

      where.AND = [
        {
          OR: [
            { patientName: { contains: term, mode: "insensitive" } },
            { code: { contains: term, mode: "insensitive" } },
            { professional: { contains: term, mode: "insensitive" } },
            { cpf: { contains: term } },
            digits ? { cpf: { contains: digits } } : {},
            digits ? { cartaoSus: { contains: digits } } : {},
          ].filter((c) => Object.keys(c).length > 0),
        },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { finishedAt: "desc" },
        include: {
          patient: true,
          roomRel: true,
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    const formattedRecords = records.map((r) => {
      const waitTime = r.waitTimeMinutes || 0;
      const isWaitHigh = waitTime > 20;

      return {
        id: r.id,
        code: r.code,
        name: r.patientName,
        cpf: r.cpf || "-",
        cartaoSus: r.cartaoSus || "-",
        date: new Date(r.createdAt).toLocaleDateString("pt-BR"),
        time: new Date(r.createdAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        specialty: r.serviceLabel || r.service,
        room: r.room || "Consultório",
        doctor: r.professional || "Profissional Clínico",
        waitTime: `${waitTime} min`,
        isWaitHigh,
        duration: r.consultationTimeMinutes ? `${r.consultationTimeMinutes} min` : "15 min",
        status: r.status === QueueStatus.FINALIZADO ? "Atendido" : "Ausente",
        cid: r.cid || undefined,
        notes: r.notes || undefined,
        createdAt: r.createdAt,
        calledAt: r.calledAt,
        attendedAt: r.attendedAt,
        finishedAt: r.finishedAt,
      };
    });

    return {
      records: formattedRecords,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Detalhes do Atendimento com Linha do Tempo e Auditoria Clínica
   */
  static async getAttendanceDetails(id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        patient: true,
        roomRel: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            registrationNumber: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new Error("Registro de atendimento não encontrado.");
    }

    // Constrói timeline
    const timeline = [
      {
        step: "Chegada / Emissão de Senha",
        timestamp: ticket.createdAt,
        description: `Senha ${ticket.code} emitida para ${ticket.patientName}`,
      },
    ];

    if (ticket.calledAt) {
      timeline.push({
        step: "Chamada no Painel",
        timestamp: ticket.calledAt,
        description: `Chamado para ${ticket.room || "Consultório"} por ${ticket.professional || "Profissional"}`,
      });
    }

    if (ticket.attendedAt) {
      timeline.push({
        step: "Início do Atendimento",
        timestamp: ticket.attendedAt,
        description: `Entrada em consulta no consultório`,
      });
    }

    if (ticket.finishedAt) {
      const isAbsent = ticket.status === QueueStatus.AUSENTE;
      timeline.push({
        step: isAbsent ? "Ausência Registrada" : "Conclusão do Atendimento",
        timestamp: ticket.finishedAt,
        description: isAbsent
          ? "Paciente não respondeu às chamadas"
          : `Atendimento finalizado. CID: ${ticket.cid || "Não informado"}`,
      });
    }

    return {
      id: ticket.id,
      code: ticket.code,
      patient: ticket.patient,
      patientName: ticket.patientName,
      cpf: ticket.cpf,
      cartaoSus: ticket.cartaoSus,
      priority: ticket.priority,
      priorityLabel: ticket.priorityLabel,
      service: ticket.serviceLabel || ticket.service,
      room: ticket.room,
      roomLabel: ticket.roomLabel,
      professional: ticket.professional,
      cid: ticket.cid,
      notes: ticket.notes,
      waitTimeMinutes: ticket.waitTimeMinutes,
      consultationTimeMinutes: ticket.consultationTimeMinutes,
      status: ticket.status === QueueStatus.FINALIZADO ? "Atendido" : "Ausente",
      timeline,
      rawTimestamps: {
        createdAt: ticket.createdAt,
        calledAt: ticket.calledAt,
        attendedAt: ticket.attendedAt,
        finishedAt: ticket.finishedAt,
      },
    };
  }

  /**
   * Exporta histórico para CSV
   */
  static async exportHistoryToCsv(params: {
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    specialty?: string;
  }) {
    const result = await this.listHistory({
      ...params,
      page: 1,
      limit: 10000,
    });

    const headers = [
      { key: "code", label: "Senha" },
      { key: "name", label: "Nome do Paciente" },
      { key: "cpf", label: "CPF" },
      { key: "cartaoSus", label: "Cartão SUS" },
      { key: "date", label: "Data" },
      { key: "time", label: "Horário" },
      { key: "specialty", label: "Especialidade" },
      { key: "room", label: "Sala" },
      { key: "doctor", label: "Profissional" },
      { key: "waitTime", label: "Tempo de Espera" },
      { key: "duration", label: "Duração da Consulta" },
      { key: "status", label: "Status" },
      { key: "cid", label: "CID Diagnosticado" },
    ];

    return toCsvString(headers, result.records);
  }
}

