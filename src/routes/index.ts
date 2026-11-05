import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "../docs/swagger";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import patientRoutes from "./patient.routes";
import ticketRoutes from "./ticket.routes";
import roomRoutes from "./room.routes";
import tvRoutes from "./tv.routes";
import statsRoutes from "./stats.routes";
import historyRoutes from "./history.routes";

const router = Router();

// Rota raiz com apresentação amigável e status da API
router.get("/", (_req, res) => {
  res.json({
    name: "🏥 FilaFácil UBS - API & WebSockets",
    status: "online",
    version: "1.0.0",
    description: "Sistema de Gerenciamento, Triagem e Chamada em Tempo Real para UBS (SUS)",
    documentation: "/docs",
    openapi: "/docs.json",
    health: "/health",
    readme: "https://github.com/AndressaSilva0/backend-filafacil#readme",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      patients: "/api/patients",
      tickets: "/api/tickets",
      rooms: "/api/rooms",
      tv: "/api/tv",
      stats: "/api/stats",
      history: "/api/history",
    },
  });
});

// Healthcheck endpoint (usado pelo Render, Docker e monitoramento)
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "FilaFacil UBS Backend",
    timestamp: new Date().toISOString(),
  });
});

// JSON da especificação OpenAPI 3.0 (compatível com Insomnia, Postman e Swagger Editor)
router.get("/docs.json", (_req, res) => {
  res.json(swaggerDocument);
});
router.get("/api-docs.json", (_req, res) => {
  res.json(swaggerDocument);
});

// Documentação interativa Swagger UI
const swaggerOptions = {
  customSiteTitle: "Documentação Interativa Swagger - FilaFácil UBS",
  customCss: ".swagger-ui .topbar { display: none }",
};

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Registrar rotas modulares da API conforme especificação oficial do FilaFácil
router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/patients", patientRoutes);

// O motor de filas pode ser acessado via /api/tickets ou /api/queue
router.use("/api/tickets", ticketRoutes);
router.use("/api/queue", ticketRoutes);

router.use("/api/rooms", roomRoutes);
router.use("/api/tv", tvRoutes);
router.use("/api/stats", statsRoutes);
router.use("/api/history", historyRoutes);

export default router;
