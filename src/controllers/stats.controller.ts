import { Request, Response } from "express";
import { StatsService } from "../services/stats.service";

export class StatsController {
  static async getDashboard(_req: Request, res: Response) {
    try {
      const stats = await StatsService.getDashboardMetrics();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getReports(req: Request, res: Response) {
    try {
      const period = (req.query.period as "today" | "week" | "month") || "month";
      const report = await StatsService.getPeriodReport(period);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async exportReport(req: Request, res: Response) {
    try {
      const period = (req.query.period as "today" | "week" | "month") || "month";
      const format = (req.query.format as "pdf" | "csv") || "pdf";

      if (format === "csv") {
        const csv = await StatsService.exportReportCsv(period);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="filafacil-relatorio-${period}.csv"`
        );
        return res.send(csv);
      }

      // Default: PDF
      const pdfBuffer = await StatsService.exportReportPdf(period);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="filafacil-relatorio-${period}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

