import { Router } from "express";
import {
  PatientController,
  patientSchema,
} from "../controllers/patient.controller";
import { validateBody } from "../middlewares/validation.middleware";

const router = Router();

// Busca rápida / Simulação CADSUS
router.get("/search", PatientController.searchCitizens);

// CRUD de pacientes
router.get("/", PatientController.listPatients);
router.get("/:id", PatientController.getPatientById);
router.post("/", validateBody(patientSchema), PatientController.createPatient);
router.put("/:id", PatientController.updatePatient);

export default router;
