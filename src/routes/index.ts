import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import patientRoutes from "./patient.routes";
import ticketRoutes from "./ticket.routes";
import roomRoutes from "./room.routes";
import tvRoutes from "./tv.routes";
import statsRoutes from "./stats.routes";
import historyRoutes from "./history.routes";

const router = Router();

// Healthcheck endpoint (usado pelo Railway, Docker e monitoramento)
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "FilaFacil UBS Backend",
    timestamp: new Date().toISOString(),
  });
});

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
