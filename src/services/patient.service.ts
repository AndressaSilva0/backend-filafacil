import { prisma } from "../config/prisma";
import { cleanCPF, formatCPF } from "../utils/cpf";
import { resolvePriorityDetails } from "../utils/ticketCode";

// Base simulada do CADSUS Nacional para auto-completar na recepção se ainda não gravado no posto local
const CADSUS_MOCK_CITIZENS = [
  {
    name: "Maria Helena Cavalcanti",
    cpf: "489.201.782-90",
    susCard: "702409188320019",
    birthDate: "1958-05-14T00:00:00.000Z",
    phone: "(98) 98844-1290",
    specialCondition: "Idoso 60+",
  },
  {
    name: "Benedita Souza Costa",
    cpf: "389.220.198-10",
    susCard: "892441029810001",
    birthDate: "1942-02-18T00:00:00.000Z",
    phone: "(98) 98711-2233",
    specialCondition: "Idoso 80+",
  },
  {
    name: "Juliana Mendes Rocha",
    cpf: "512.774.920-33",
    susCard: "712982311020049",
    birthDate: "1997-09-12T00:00:00.000Z",
    phone: "(98) 99123-4567",
    specialCondition: "Gestante",
  },
  {
    name: "Carlos Eduardo Silveira",
    cpf: "612.339.401-22",
    susCard: "104992838400119",
    birthDate: "1988-06-25T00:00:00.000Z",
    phone: "(98) 98144-8899",
    specialCondition: "Convencional",
  },
  {
    name: "Lucas Gabriel Ferreira",
    cpf: "194.882.341-45",
    susCard: "819233010002199",
    birthDate: "1992-03-10T00:00:00.000Z",
    phone: "(98) 99199-0011",
    specialCondition: "PCD",
  },
];

export class PatientService {
  /**
   * Busca unificada por CPF, CNS ou Nome (incluindo base CADSUS)
   */
  static async searchCitizens(query: string) {
    const raw = (query || "").trim();
    if (!raw) return [];

    const digits = cleanCPF(raw);
    const formatted = formatCPF(digits);

    // 1. Busca no banco de dados local
    const localPatients = await prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: raw, mode: "insensitive" } },
          { cpf: { contains: raw } },
          { cpf: { contains: digits } },
          { cpf: { contains: formatted } },
          { susCard: { contains: raw } },
          { susCard: { contains: digits } },
        ],
      },
      take: 10,
    });

    if (localPatients.length > 0) {
      return localPatients.map((p) => ({
        ...p,
        source: "LOCAL_DATABASE",
      }));
    }

    // 2. Simulação CADSUS caso não encontrado no banco local
    const cadsusMatches = CADSUS_MOCK_CITIZENS.filter((c) => {
      const matchName = c.name.toLowerCase().includes(raw.toLowerCase());
      const matchCpf = cleanCPF(c.cpf).includes(digits) || c.cpf.includes(raw);
      const matchSus = c.susCard.includes(digits) || c.susCard.includes(raw);
      return matchName || matchCpf || matchSus;
    });

    return cadsusMatches.map((c) => ({
      id: `cadsus-${cleanCPF(c.cpf)}`,
      name: c.name,
      cpf: c.cpf,
      susCard: c.susCard,
      birthDate: new Date(c.birthDate),
      phone: c.phone,
      specialCondition: c.specialCondition,
      source: "CADSUS_INTEGRATION",
    }));
  }

  static async listPatients(search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search && search.trim()) {
      const raw = search.trim();
      const digits = cleanCPF(raw);
      where.OR = [
        { name: { contains: raw, mode: "insensitive" } },
        { cpf: { contains: digits } },
        { susCard: { contains: digits } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      patients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPatientById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!patient) {
      throw new Error("Paciente não encontrado.");
    }

    return patient;
  }

  static async createPatient(data: {
    name: string;
    cpf?: string;
    susCard?: string;
    birthDate?: string | Date;
    phone?: string;
    specialCondition?: string;
    priority?: string;
  }) {
    const cleanedCpf = data.cpf ? cleanCPF(data.cpf) : null;
    const formattedCpf = cleanedCpf ? formatCPF(cleanedCpf) : null;
    const cleanedSus = data.susCard ? cleanCPF(data.susCard) : null;

    // Verifica unicidade de CPF ou SUS se fornecido
    if (formattedCpf || cleanedSus) {
      const existing = await prisma.patient.findFirst({
        where: {
          OR: [
            formattedCpf ? { cpf: formattedCpf } : {},
            cleanedSus ? { susCard: cleanedSus } : {},
          ].filter((cond) => Object.keys(cond).length > 0),
        },
      });

      if (existing) {
        return existing;
      }
    }

    const priorityInfo = resolvePriorityDetails(data.priority, data.specialCondition);

    const patient = await prisma.patient.create({
      data: {
        name: data.name.trim(),
        cpf: formattedCpf,
        susCard: cleanedSus,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        phone: data.phone,
        priority: priorityInfo.priority,
        priorityLabel: priorityInfo.priorityLabel,
        specialCondition: data.specialCondition,
      },
    });

    return patient;
  }

  static async updatePatient(
    id: string,
    data: {
      name?: string;
      cpf?: string;
      susCard?: string;
      birthDate?: string | Date;
      phone?: string;
      specialCondition?: string;
      priority?: string;
    }
  ) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.cpf !== undefined) updateData.cpf = data.cpf ? formatCPF(cleanCPF(data.cpf)) : null;
    if (data.susCard !== undefined) updateData.susCard = data.susCard ? cleanCPF(data.susCard) : null;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.specialCondition !== undefined) updateData.specialCondition = data.specialCondition;

    if (data.priority || data.specialCondition) {
      const priorityInfo = resolvePriorityDetails(data.priority, data.specialCondition);
      updateData.priority = priorityInfo.priority;
      updateData.priorityLabel = priorityInfo.priorityLabel;
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }
}

