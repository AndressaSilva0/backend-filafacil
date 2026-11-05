import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { initQueueSocket } from "./sockets/queue.socket";
import { prisma } from "./config/prisma";

const PORT = Number(process.env.PORT) || 3001;
const allowedOrigin = process.env.CLIENT_ORIGIN || "*";

// Criar servidor HTTP integrando Express
const server = http.createServer(app);

// Inicializar Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigin === "*" ? "*" : allowedOrigin.split(","),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initQueueSocket(io);

// Iniciar servidor
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor FilaFácil rodando na porta ${PORT}`);
  console.log(`📡 Socket.IO pronto para conexões em tempo real`);
  console.log(`🏥 Healthcheck disponível em: http://localhost:${PORT}/health`);
});

// Tratamento para encerramento gracioso (Railway restarts/deploys)
const handleShutdown = async (signal: string) => {
  console.log(`\nRecebido sinal ${signal}. Encerrando conexões com elegância...`);
  try {
    await prisma.$disconnect();
    server.close(() => {
      console.log("Servidor HTTP e conexões fechadas.");
      process.exit(0);
    });
  } catch (err) {
    console.error("Erro durante o encerramento:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
