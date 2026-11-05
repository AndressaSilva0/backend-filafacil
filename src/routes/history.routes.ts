import { Router } from "express";
import { HistoryController } from "../controllers/history.controller";

const router = Router();

router.get("/", HistoryController.listHistory);
router.get("/export", HistoryController.exportHistory);
router.get("/:id", HistoryController.getAttendanceDetails);

export default router;

