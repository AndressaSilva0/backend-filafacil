import { Request, Response } from "express";
import { HistoryService } from "../services/history.service";

export class HistoryController {
  static async listHistory(req: Request, res: Response) {
    try {
      const date = req.query.date ? String(req.query.date) : undefined;
      const period = req.query.period ? String(req.query.period) : undefined;
      const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
      const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;
      const specialty = req.query.specialty ? String(req.query.specialty) : undefined;
      const room = req.query.room ? String(req.query.room) : undefined;
      const doctor = req.query.doctor ? String(req.query.doctor) : undefined;
      const search = req.query.search || req.query.q ? String(req.query.search || req.query.q) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;

      const data = await HistoryService.listHistory({
        date,
        period,
        startDate,
        endDate,
        status,
        specialty,
        room,
        doctor,
        search,
        page,
        limit,
      });

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAttendanceDetails(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const details = await HistoryService.getAttendanceDetails(id);
      res.json(details);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async exportHistory(req: Request, res: Response) {
    try {
      const date = req.query.date ? String(req.query.date) : undefined;
      const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
      const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;
      const specialty = req.query.specialty ? String(req.query.specialty) : undefined;

      const csv = await HistoryService.exportHistoryToCsv({
        date,
        startDate,
        endDate,
        status,
        specialty,
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="filafacil-historico-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
