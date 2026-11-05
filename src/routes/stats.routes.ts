import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";

const router = Router();

router.get("/dashboard", StatsController.getDashboard);
router.get("/reports", StatsController.getReports);
router.get("/export", StatsController.exportReport);

export default router;

