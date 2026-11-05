import { Server, Socket } from "socket.io";

let ioInstance: Server | null = null;

export const initQueueSocket = (io: Server) => {
  ioInstance = io;

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

    // Cliente pode entrar na sala da fila geral ou de uma unidade específica
    socket.on("join-queue", (room = "general-queue") => {
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} entrou na sala: ${room}`);
    });

    socket.on("leave-queue", (room = "general-queue") => {
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
    });
  });
};

export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error("Socket.IO ainda não foi inicializado!");
  }
  return ioInstance;
};

/**
 * Notifica nova senha chamada com { código, nome, sala, médico, prioridade, timestamp }
 */
export const emitTicketCalled = (payload: {
  code: string;
  patientName: string;
  room?: string | null;
  doctor?: string | null;
  priority?: string | null;
  priorityLabel?: string | null;
  specialty?: string | null;
  timestamp: string;
  ticketId?: string;
}) => {
  if (ioInstance) {
    // Evento oficial conforme especificação
    ioInstance.emit("ticket:called", payload);
    // Aliases para retrocompatibilidade
    ioInstance.emit("patient:called", payload);
  }
};

/**
 * Sincroniza guichês e painéis quando um paciente entra em atendimento, finaliza ou falta
 */
export const emitTicketStatusUpdated = (payload: {
  ticketId: string;
  code: string;
  status: string;
  updatedAt: string;
  ticket?: any;
}) => {
  if (ioInstance) {
    ioInstance.emit("ticket:status-updated", payload);
    ioInstance.emit("queue:updated", payload);
  }
};

/**
 * Atualiza contadores em tempo real para o dashboard
 */
export const emitQueueMetricsUpdated = (metrics: any) => {
  if (ioInstance) {
    ioInstance.emit("queue:metrics-updated", metrics);
  }
};

/**
 * Emite atualização geral de fila
 */
export const emitQueueUpdate = (data: unknown) => {
  if (ioInstance) {
    ioInstance.emit("queue:updated", data);
  }
};
