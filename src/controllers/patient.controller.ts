import { Request, Response } from "express";
import { z } from "zod";
import { PatientService } from "../services/patient.service";

export const patientSchema = z.object({
  name: z.string().min(2, "Nome do paciente é obrigatório."),
  cpf: z.string().optional().nullable(),
  susCard: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  specialCondition: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
});

export class PatientController {
  static async searchCitizens(req: Request, res: Response) {
    try {
      const q = String(req.query.q || req.query.search || "");
      const results = await PatientService.searchCitizens(q);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async listPatients(req: Request, res: Response) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;

      const data = await PatientService.listPatients(search, page, limit);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPatientById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const patient = await PatientService.getPatientById(id);
      res.json(patient);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createPatient(req: Request, res: Response) {
    try {
      const patient = await PatientService.createPatient(req.body);
      res.status(201).json({
        message: "Paciente cadastrado com sucesso!",
        patient,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updatePatient(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const patient = await PatientService.updatePatient(id, req.body);
      res.json({
        message: "Dados do paciente atualizados com sucesso!",
        patient,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
