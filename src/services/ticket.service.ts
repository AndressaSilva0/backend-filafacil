import { prisma } from "../config/prisma";
import { QueueStatus, Priority, ServiceType } from "@prisma/client";
import {
  generateDailyTicketCode,
  resolvePriorityDetails,
  resolveServiceType,
} from "../utils/ticketCode";
import { generateThermalReceipt } from "../utils/qrCode";
import { cleanCPF, formatCPF } from "../utils/cpf";
import { parseFlexibleDate } from "../utils/date";
import {
  emitTicketCalled,
  emitTicketStatusUpdated,
  emitQueueMetricsUpdated,
} from "../sockets/queue.socket";
import { toCsvString } from "../utils/csvExport";

export class TicketService {
  /**
   * Emissão de Senha / Entrada na Fila
   */
  static async createTicket(data: {
    patientId?: string;
    patientName?: string;
    cpf?: string;
    cartaoSus?: string;
    birthDate?: string | Date;
    phone?: string;
    priority?: string;
    specialCondition?: string;
    service?: string;
    notes?: string;
    roomId?: string;
    room?: string;
    date?: string;
    selectedDate?: string;
    scheduledDate?: string;
    time?: string;
    selectedTime?: string;
    scheduledTime?: string;
  }) {
    const name = (data.patientName || "").trim();
    const rawCpf = data.cpf ? cleanCPF(data.cpf) : null;
    const formattedCpf = rawCpf ? formatCPF(rawCpf) : null;
    const cleanedSus = data.cartaoSus ? cleanCPF(data.cartaoSus) : null;

    let patient = null;

    // 1. Tenta achar paciente existente
    if (data.patientId) {
      patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
    }

    if (!patient && (formattedCpf || cleanedSus)) {
      patient = await prisma.patient.findFirst({
        where: {
          OR: [
            formattedCpf ? { cpf: formattedCpf } : {},
            cleanedSus ? { susCard: cleanedSus } : {},
          ].filter((cond) => Object.keys(cond).length > 0),
        },
      });
    }

    const priorityInfo = resolvePriorityDetails(data.priority, data.specialCondition);
    const serviceInfo = resolveServiceType(data.service);

    // 2. Se não existir, cadastra paciente
    if (!patient) {
      if (!name) {
        throw new Error("Nome do paciente é obrigatório para emissão de senha.");
      }

      patient = await prisma.patient.create({
        data: {
          name,
          cpf: formattedCpf,
          susCard: cleanedSus,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          phone: data.phone,
          priority: priorityInfo.priority,
          priorityLabel: priorityInfo.priorityLabel,
          specialCondition: data.specialCondition,
        },
      });
    }

    // 3. Gera código sequencial diário (URG-001, PRE-001, NOR-001)
    const code = await generateDailyTicketCode(priorityInfo.prefix);

    // Calcula idade aproximada se tiver data de nascimento
    let age: number | undefined = undefined;
    if (patient.birthDate) {
      const birth = new Date(patient.birthDate);
      const diffMs = Date.now() - birth.getTime();
      age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
    }

    // 4. Processa data e horário selecionado no calendário e agendamento
    let scheduledDateTime: Date | null = null;
    const rawDate = data.scheduledDate || data.selectedDate || data.date;
    if (rawDate) {
      const parsedDate = parseFlexibleDate(rawDate);
      if (parsedDate) {
        scheduledDateTime = new Date(parsedDate);
        const rawTime = data.scheduledTime || data.selectedTime || data.time;
        if (rawTime) {
          const match = rawTime.match(/(\d{1,2}):(\d{2})/);
          if (match) {
            scheduledDateTime.setHours(Number(match[1]), Number(match[2]), 0, 0);
          }
        }
      }
    }

    // 5. Cria ticket
    const ticket = await prisma.ticket.create({
      data: {
        code,
        patientId: patient.id,
        patientName: patient.name,
        cpf: patient.cpf,
        cartaoSus: patient.susCard,
        birthDate: patient.birthDate,
        phone: patient.phone,
        age,
        priority: priorityInfo.priority,
        priorityWeight: priorityInfo.priorityWeight,
        priorityLabel: priorityInfo.priorityLabel,
        service: serviceInfo.service,
        serviceLabel: serviceInfo.serviceLabel,
        status: QueueStatus.AGUARDANDO,
        roomId: data.roomId,
        room: data.room,
        notes: data.notes,
        scheduledAt: scheduledDateTime,
      },
      include: {
        patient: true,
        roomRel: true,
      },
    });

    // 6. Gera comprovante térmico com QR Code
    const receipt = generateThermalReceipt(ticket);

    // 7. Atualiza contadores em tempo real via WebSocket
    this.broadcastMetrics();

    return {
      ticket,
      receipt,
    };
  }

  /**
   * Listagem de fila com filtros e paginação
   */
  static async listTickets(params: {
    status?: string;
    specialty?: string;
    room?: string;
    doctor?: string;
    priority?: string;
    date?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 25;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtro de status
    if (params.status && params.status !== "ALL") {
      const s = params.status.toUpperCase();
      if (s === "ATENDIDOS") {
        where.status = QueueStatus.FINALIZADO;
      } else if (s === "AUSENTES") {
        where.status = QueueStatus.AUSENTE;
      } else if (s in QueueStatus) {
        where.status = s as QueueStatus;
      }
    }

    // Filtro por prioridade (URGENTE, PREFERENCIAL, NORMAL)
    if (params.priority && params.priority !== "ALL") {
      const p = params.priority.toUpperCase();
      if (p in Priority) {
        where.priority = p as Priority;
      }
    }

    // Filtro por especialidade
    if (params.specialty && params.specialty !== "ALL") {
      const { service } = resolveServiceType(params.specialty);
      where.service = service;
    }

    // Filtro por sala
    if (params.room && params.room !== "ALL") {
      where.OR = [
        { room: { contains: params.room, mode: "insensitive" } },
        { roomId: params.room },
      ];
    }

    // Filtro por médico / profissional
    if (params.doctor && params.doctor !== "ALL") {
      where.professional = { contains: params.doctor, mode: "insensitive" };
    }

    // Filtro por data (avalia tanto createdAt quanto scheduledAt do agendamento)
    if (params.date) {
      const parsedDate = parseFlexibleDate(params.date);
      if (parsedDate) {
        const dayStart = new Date(parsedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(parsedDate);
        dayEnd.setHours(23, 59, 59, 999);

        where.AND = [
          ...(where.AND || []),
          {
            OR: [
              { createdAt: { gte: dayStart, lte: dayEnd } },
              { scheduledAt: { gte: dayStart, lte: dayEnd } },
            ],
          },
        ];
      }
    }

    // Busca textual (nome, CPF, código, cartão SUS, profissional)
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

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { status: "asc" },
          { priorityWeight: "desc" },
          { createdAt: "asc" },
        ],
        include: {
          patient: true,
          roomRel: true,
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Fila de Espera Ordenada por Prioridade Legal do SUS:
   * 1. Urgência Manchester (peso 4)
   * 2. Superprioridade 80+ (peso 3)
   * 3. Prioritários 60+, Gestantes, PCD (peso 2)
   * 4. Convencional (peso 1)
   * Desempate: Horário de chegada (FIFO - createdAt asc)
   */
  static async getWaitingQueue() {
    return prisma.ticket.findMany({
      where: {
        status: QueueStatus.AGUARDANDO,
      },
      orderBy: [
        { priorityWeight: "desc" },
        { createdAt: "asc" },
      ],
      include: {
        patient: true,
        roomRel: true,
      },
    });
  }

  /**
   * Chamar Próximo Paciente da Fila ou Senha Específica
   */
  static async callTicket(params: {
    ticketId?: string;
    roomId?: string;
    roomName?: string;
    professionalName?: string;
    userId?: string;
  }) {
    let ticket = null;

    if (params.ticketId) {
      ticket = await prisma.ticket.findUnique({
        where: { id: params.ticketId },
      });
    } else {
      // Pega o primeiro da fila legal do SUS
      const waiting = await this.getWaitingQueue();
      if (waiting.length === 0) {
        throw new Error("Não há pacientes aguardando na fila no momento.");
      }
      ticket = waiting[0];
    }

    if (!ticket) {
      throw new Error("Senha não encontrada.");
    }

    let roomName: string | null = params.roomName || ticket.room;
    let roomLabel: string | null = ticket.roomLabel;
    let assignedProf: string | null = params.professionalName || ticket.professional || null;

    // Se passou roomId, busca dados da sala
    if (params.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: params.roomId },
      });
      if (room) {
        roomName = room.name;
        roomLabel = room.label;
        if (!assignedProf) assignedProf = room.assignedProfessional;
      }
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: QueueStatus.CHAMANDO,
        calledAt: new Date(),
        callCount: { increment: 1 },
        roomId: params.roomId || ticket.roomId,
        room: roomName || "Consultório",
        roomLabel: roomLabel || "Atendimento",
        userId: params.userId || ticket.userId,
        professional: assignedProf || "Profissional de Saúde",
      },
      include: {
        patient: true,
        roomRel: true,
      },
    });

    // Dispara WebSocket para Painel de TV
    emitTicketCalled({
      ticketId: updated.id,
      code: updated.code,
      patientName: updated.patientName,
      room: updated.room,
      doctor: updated.professional,
      priority: updated.priority,
      priorityLabel: updated.priorityLabel,
      specialty: updated.serviceLabel,
      timestamp: updated.calledAt!.toISOString(),
    });

    emitTicketStatusUpdated({
      ticketId: updated.id,
      code: updated.code,
      status: QueueStatus.CHAMANDO,
      updatedAt: new Date().toISOString(),
      ticket: updated,
    });

    this.broadcastMetrics();

    return updated;
  }

  /**
   * Rechamar Paciente (repete alerta no Painel de TV e som)
   */
  static async recallTicket(id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new Error("Senha não encontrada.");
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: QueueStatus.CHAMANDO,
        calledAt: new Date(),
        callCount: { increment: 1 },
      },
      include: {
        patient: true,
        roomRel: true,
      },
    });

    emitTicketCalled({
      ticketId: updated.id,
      code: updated.code,
      patientName: updated.patientName,
      room: updated.room,
      doctor: updated.professional,
      priority: updated.priority,
      priorityLabel: updated.priorityLabel,
      specialty: updated.serviceLabel,
      timestamp: updated.calledAt!.toISOString(),
    });

    return updated;
  }

  /**
   * Iniciar Atendimento
   */
  static async startAttendance(id: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new Error("Senha não encontrada.");

    const now = new Date();
    // Tempo de espera em minutos desde a chegada até o início
    const waitTime = Math.max(
      1,
      Math.round((now.getTime() - new Date(ticket.createdAt).getTime()) / 60000)
    );

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: QueueStatus.EM_ATENDIMENTO,
        attendedAt: now,
        waitTimeMinutes: waitTime,
      },
      include: {
        patient: true,
        roomRel: true,
      },
    });

    emitTicketStatusUpdated({
      ticketId: updated.id,
      code: updated.code,
      status: QueueStatus.EM_ATENDIMENTO,
      updatedAt: now.toISOString(),
      ticket: updated,
    });

    this.broadcastMetrics();

    return updated;
  }

  /**
   * Finalizar Atendimento (com CID e anotações opcionais)
   */
  static async finishAttendance(
    id: string,
    data?: { cid?: string; notes?: string }
  ) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new Error("Senha não encontrada.");

    const now = new Date();

    // Calcula tempo de espera caso não tenha sido calculado
    const attendedTime = ticket.attendedAt ? new Date(ticket.attendedAt) : now;
    const waitTime = ticket.waitTimeMinutes || Math.max(
      1,
      Math.round((attendedTime.getTime() - new Date(ticket.createdAt).getTime()) / 60000)
    );

    // Calcula duração da consulta em minutos
    const consultationTime = Math.max(
      1,
      Math.round((now.getTime() - attendedTime.getTime()) / 60000)
    );

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: QueueStatus.FINALIZADO,
        finishedAt: now,
        waitTimeMinutes: waitTime,
        consultationTimeMinutes: consultationTime,
        cid: data?.cid || ticket.cid,
        notes: data?.notes !== undefined ? data.notes : ticket.notes,
      },
      include: {
        patient: true,
        roomRel: true,
      },
    });

    emitTicketStatusUpdated({
      ticketId: updated.id,
      code: updated.code,
      status: QueueStatus.FINALIZADO,
      updatedAt: now.toISOString(),
      ticket: updated,
    });

    this.broadcastMetrics();

    return updated;
  }

  /**
   * Marcar Paciente como Ausente
   */
  static async markAbsent(id: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new Error("Senha não encontrada.");

    const now = new Date();

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: QueueStatus.AUSENTE,
        finishedAt: now,
      },
      include: {
        patient: true,
        roomRel: true,
      },
    });

    emitTicketStatusUpdated({
      ticketId: updated.id,
      code: updated.code,
      status: QueueStatus.AUSENTE,
      updatedAt: now.toISOString(),
      ticket: updated,
    });

    this.broadcastMetrics();

    return updated;
  }

  /**
   * Exportar lista de senhas para CSV
   */
  static async exportTicketsToCsv(params: {
    status?: string;
    specialty?: string;
    date?: string;
  }) {
    const result = await this.listTickets({
      ...params,
      page: 1,
      limit: 5000,
    });

    const headers = [
      { key: "code", label: "Senha" },
      { key: "patientName", label: "Nome do Paciente" },
      { key: "cpf", label: "CPF" },
      { key: "cartaoSus", label: "Cartão SUS" },
      { key: "priorityLabel", label: "Prioridade" },
      { key: "serviceLabel", label: "Especialidade" },
      { key: "room", label: "Consultório/Sala" },
      { key: "professional", label: "Profissional" },
      { key: "status", label: "Status" },
      { key: "createdAtFormatted", label: "Horário Chegada" },
      { key: "waitTimeFormatted", label: "Tempo de Espera" },
    ];

    const mapped = result.tickets.map((t) => ({
      code: t.code,
      patientName: t.patientName,
      cpf: t.cpf || "-",
      cartaoSus: t.cartaoSus || "-",
      priorityLabel: t.priorityLabel || t.priority,
      serviceLabel: t.serviceLabel || t.service,
      room: t.room || "-",
      professional: t.professional || "-",
      status: t.status,
      createdAtFormatted: new Date(t.createdAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      waitTimeFormatted: t.waitTimeMinutes ? `${t.waitTimeMinutes} min` : "Aguardando",
    }));

    return toCsvString(headers, mapped);
  }

  /**
   * Dispara métricas atualizadas para todos os sockets conectados
   */
  static async broadcastMetrics() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [waiting, attendedToday, absentToday] = await Promise.all([
        prisma.ticket.findMany({
          where: { status: QueueStatus.AGUARDANDO },
          select: { priority: true, createdAt: true },
        }),
        prisma.ticket.findMany({
          where: {
            status: QueueStatus.FINALIZADO,
            finishedAt: { gte: todayStart },
          },
          select: { waitTimeMinutes: true },
        }),
        prisma.ticket.count({
          where: {
            status: QueueStatus.AUSENTE,
            createdAt: { gte: todayStart },
          },
        }),
      ]);

      let totalWait = 0;
      attendedToday.forEach((t) => {
        totalWait += t.waitTimeMinutes || 0;
      });

      const avgWait = attendedToday.length > 0 ? Math.round(totalWait / attendedToday.length) : 12;

      const metrics = {
        totalWaiting: waiting.length,
        totalAttendedToday: attendedToday.length,
        totalAbsentToday: absentToday,
        averageWaitMinutes: avgWait,
        byPriority: {
          URGENTE: waiting.filter((w) => w.priority === Priority.URGENTE).length,
          PREFERENCIAL: waiting.filter((w) => w.priority === Priority.PREFERENCIAL).length,
          NORMAL: waiting.filter((w) => w.priority === Priority.NORMAL).length,
        },
        timestamp: new Date().toISOString(),
      };

      emitQueueMetricsUpdated(metrics);
    } catch (e) {
      console.error("Erro ao emitir broadcast de métricas:", e);
    }
  }
}
