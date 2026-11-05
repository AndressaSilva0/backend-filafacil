import { Priority, ServiceType } from "@prisma/client";
import { prisma } from "../config/prisma";

export interface PriorityInfo {
  priority: Priority;
  priorityWeight: number;
  priorityLabel: string;
  prefix: string;
}

/**
 * Determina o peso legal da prioridade e rótulo segundo a legislação do SUS e Estatuto do Idoso
 */
export function resolvePriorityDetails(priorityInput?: string, conditionInput?: string): PriorityInfo {
  const normPrio = (priorityInput || "").toUpperCase();
  const normCond = (conditionInput || "").toUpperCase();

  // 1. Urgência clínica (Triagem Manchester)
  if (normPrio.includes("URG") || normCond.includes("URG") || normCond.includes("MANCHESTER")) {
    return {
      priority: Priority.URGENTE,
      priorityWeight: 4,
      priorityLabel: "Urgência (Triagem Manchester)",
      prefix: "URG",
    };
  }

  // 2. Superprioridade 80+ (Art. 71 da Lei nº 10.741 - Estatuto do Idoso)
  if (normCond.includes("80") || normPrio.includes("80")) {
    return {
      priority: Priority.PREFERENCIAL,
      priorityWeight: 3,
      priorityLabel: "Superprioridade 80+",
      prefix: "PRE",
    };
  }

  // 3. Prioritários legais (60+, Gestante, Lactante, PCD, Criança de colo)
  if (
    normPrio.includes("PREF") ||
    normCond.includes("60") ||
    normCond.includes("GESTANTE") ||
    normCond.includes("PCD") ||
    normCond.includes("LACTANTE") ||
    normCond.includes("DEFICIENTE")
  ) {
    let label = "Prioritário";
    if (normCond.includes("60")) label = "Prioritário (Idoso 60+)";
    else if (normCond.includes("GESTANTE")) label = "Prioritário (Gestante)";
    else if (normCond.includes("PCD") || normCond.includes("DEFICIENTE")) label = "Prioritário (PCD)";
    else if (normCond.includes("LACTANTE")) label = "Prioritário (Lactante)";

    return {
      priority: Priority.PREFERENCIAL,
      priorityWeight: 2,
      priorityLabel: label,
      prefix: "PRE",
    };
  }

  // 4. Atendimento Convencional / Geral
  return {
    priority: Priority.NORMAL,
    priorityWeight: 1,
    priorityLabel: "Atendimento Convencional (Normal)",
    prefix: "NOR",
  };
}

/**
 * Gera código sequencial diário por prioridade (ex: URG-001, PRE-001, NOR-001)
 */
export async function generateDailyTicketCode(prefix: string): Promise<string> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Conta quantas senhas com esse prefixo foram geradas hoje
  const countToday = await prisma.ticket.count({
    where: {
      code: {
        startsWith: prefix,
      },
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const nextNumber = countToday + 1;
  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  CLINICO_GERAL: "Clínico Geral",
  PEDIATRIA: "Pediatria",
  GINECOLOGIA: "Ginecologia",
  ODONTOLOGIA: "Odontologia",
  ENFERMAGEM: "Enfermagem",
  VACINACAO: "Vacinação",
  TRIAGEM: "Triagem",
  CURATIVO: "Curativo",
  FARMACIA: "Farmácia",
  CONSULTA_MEDICA: "Consulta Médica",
};

export function resolveServiceType(rawService?: string): { service: ServiceType; serviceLabel: string } {
  if (!rawService) {
    return { service: ServiceType.CLINICO_GERAL, serviceLabel: SERVICE_LABELS.CLINICO_GERAL };
  }

  const cleaned = rawService.toUpperCase().replace(/\s+/g, "_");

  if (cleaned.includes("PEDIATR")) return { service: ServiceType.PEDIATRIA, serviceLabel: SERVICE_LABELS.PEDIATRIA };
  if (cleaned.includes("GINECO")) return { service: ServiceType.GINECOLOGIA, serviceLabel: SERVICE_LABELS.GINECOLOGIA };
  if (cleaned.includes("ODONTO")) return { service: ServiceType.ODONTOLOGIA, serviceLabel: SERVICE_LABELS.ODONTOLOGIA };
  if (cleaned.includes("ENFERM")) return { service: ServiceType.ENFERMAGEM, serviceLabel: SERVICE_LABELS.ENFERMAGEM };
  if (cleaned.includes("VACIN")) return { service: ServiceType.VACINACAO, serviceLabel: SERVICE_LABELS.VACINACAO };
  if (cleaned.includes("TRIAG")) return { service: ServiceType.TRIAGEM, serviceLabel: SERVICE_LABELS.TRIAGEM };
  if (cleaned.includes("CURAT")) return { service: ServiceType.CURATIVO, serviceLabel: SERVICE_LABELS.CURATIVO };
  if (cleaned.includes("FARMAC")) return { service: ServiceType.FARMACIA, serviceLabel: SERVICE_LABELS.FARMACIA };
  if (cleaned.includes("CONSULTA")) return { service: ServiceType.CONSULTA_MEDICA, serviceLabel: SERVICE_LABELS.CONSULTA_MEDICA };

  return { service: ServiceType.CLINICO_GERAL, serviceLabel: SERVICE_LABELS.CLINICO_GERAL };
}

