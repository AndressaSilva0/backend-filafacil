import { Router } from "express";
import {
  TicketController,
  createTicketSchema,
} from "../controllers/ticket.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { optionalAuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Emissão de senha e listagem
router.post("/", validateBody(createTicketSchema), TicketController.createTicket);
router.get("/", TicketController.listTickets);
router.get("/waiting", TicketController.getWaitingQueue);
router.get("/export", TicketController.exportTickets);

// Ações no ciclo de vida da fila
router.post("/call-next", optionalAuthMiddleware as any, TicketController.callNext as any);
router.post("/:id/call", optionalAuthMiddleware as any, TicketController.callTicket as any);
router.post("/:id/recall", TicketController.recallTicket);
router.post("/:id/start", TicketController.startAttendance);
router.post("/:id/finish", TicketController.finishAttendance);
router.post("/:id/absent", TicketController.markAbsent);

export default router;

