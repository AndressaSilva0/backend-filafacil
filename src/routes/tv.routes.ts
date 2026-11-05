import { Router } from "express";
import { TVController } from "../controllers/tv.controller";

const router = Router();

router.get("/current-call", TVController.getCurrentCall);
router.get("/upcoming", TVController.getUpcomingTickets);

export default router;

