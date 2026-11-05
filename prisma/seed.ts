import { PrismaClient, Priority, QueueStatus, Role, ServiceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed completo do FilaFácil...");

  // 1. Limpeza
  await prisma.ticket.deleteMany();
  await prisma.room.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("senha123", 10);

  // 2. Criar Operadores do Sistema
  const recepcao = await prisma.user.create({
    data: {
      name: "Mariana Souza",
      cpf: "123.456.789-01",
      email: "recepcao@filafacil.ubs",
      password: passwordHash,
      role: Role.RECEPCIONISTA,
      unit: "UBS Centro - Dr. José Silva",
      phone: "(98) 98844-0001",
      registrationNumber: "MAT-2024-001",
      acceptedTerms: true,
      avatarUrl: "/images/avatars/avatar-receptionist.svg",
    },
  });

  const medica = await prisma.user.create({
    data: {
      name: "Dra. Mariana Vasconcellos",
      cpf: "512.774.920-33",
      email: "medica@filafacil.ubs",
      password: passwordHash,
      role: Role.MEDICO,
      unit: "UBS Centro - Dr. José Silva",
      phone: "(98) 98844-0002",
      registrationNumber: "CRM-MA 12.894",
      acceptedTerms: true,
      avatarUrl: "/images/avatars/avatar-female-doctor.jpg",
    },
  });

  const medico2 = await prisma.user.create({
    data: {
      name: "Dr. Roberto Carlos",
      cpf: "612.339.401-22",
      email: "roberto@filafacil.ubs",
      password: passwordHash,
      role: Role.MEDICO,
      unit: "UBS Centro - Dr. José Silva",
      phone: "(98) 98844-0003",
      registrationNumber: "CRM-MA 14.502",
      acceptedTerms: true,
      avatarUrl: "/images/avatars/avatar-doctor-portrait.jpg",
    },
  });

  const enfermeira = await prisma.user.create({
    data: {
      name: "Enf. Clara Silveira",
      cpf: "389.220.198-10",
      email: "enfermeira@filafacil.ubs",
      password: passwordHash,
      role: Role.ENFERMEIRO,
      unit: "UBS Centro - Dr. José Silva",
      phone: "(98) 98844-0004",
      registrationNumber: "COREN-MA 45.102",
      acceptedTerms: true,
      avatarUrl: "/images/avatars/avatar-nurse.svg",
    },
  });

  console.log("✅ Usuários operadores criados com sucesso.");

  // 3. Criar Salas e Consultórios
  const room1 = await prisma.room.create({
    data: {
      name: "Consultório 01",
      label: "Consultório Médico - Clínico Geral",
      defaultService: ServiceType.CLINICO_GERAL,
      assignedProfessional: medica.name,
      assignedUserId: medica.id,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: "Consultório 02",
      label: "Consultório Médico - Clínico Geral",
      defaultService: ServiceType.CLINICO_GERAL,
      assignedProfessional: medico2.name,
      assignedUserId: medico2.id,
    },
  });

  const room3 = await prisma.room.create({
    data: {
      name: "Consultório 03",
      label: "Gabinete Odontológico",
      defaultService: ServiceType.ODONTOLOGIA,
      assignedProfessional: "Dra. Vanessa Prado",
    },
  });

  const room4 = await prisma.room.create({
    data: {
      name: "Triagem Rápida",
      label: "Acolhimento & Triagem de Manchester",
      defaultService: ServiceType.TRIAGEM,
      assignedProfessional: enfermeira.name,
      assignedUserId: enfermeira.id,
    },
  });

  const room5 = await prisma.room.create({
    data: {
      name: "Sala de Vacina",
      label: "Imunização & Curativos",
      defaultService: ServiceType.VACINACAO,
      assignedProfessional: "Tec. Lúcia Mendes",
    },
  });

  console.log("✅ Salas e consultórios cadastrados.");

  // 4. Criar Pacientes
  const pBenedita = await prisma.patient.create({
    data: {
      name: "Benedita Souza Costa",
      cpf: "389.220.198-10",
      susCard: "892441029810001",
      birthDate: new Date("1942-02-18"),
      phone: "(98) 98711-2233",
      priority: Priority.PREFERENCIAL,
      priorityLabel: "Superprioridade 80+",
      specialCondition: "Idoso 80+",
    },
  });

  const pJuliana = await prisma.patient.create({
    data: {
      name: "Juliana Mendes Rocha",
      cpf: "512.774.920-33",
      susCard: "712982311020049",
      birthDate: new Date("1997-09-12"),
      phone: "(98) 99123-4567",
      priority: Priority.PREFERENCIAL,
      priorityLabel: "Prioritário (Gestante)",
      specialCondition: "Gestante",
    },
  });

  const pMariaHelena = await prisma.patient.create({
    data: {
      name: "Maria Helena Cavalcanti",
      cpf: "489.201.782-90",
      susCard: "702409188320019",
      birthDate: new Date("1958-05-14"),
      phone: "(98) 98844-1290",
      priority: Priority.PREFERENCIAL,
      priorityLabel: "Prioritário (Idoso 60+)",
      specialCondition: "Idoso 60+",
    },
  });

  const pLucas = await prisma.patient.create({
    data: {
      name: "Lucas Gabriel Ferreira",
      cpf: "194.882.341-45",
      susCard: "819233010002199",
      birthDate: new Date("1992-03-10"),
      phone: "(98) 99199-0011",
      priority: Priority.PREFERENCIAL,
      priorityLabel: "Prioritário (PCD)",
      specialCondition: "PCD",
    },
  });

  const pCarlos = await prisma.patient.create({
    data: {
      name: "Carlos Eduardo Silveira",
      cpf: "612.339.401-22",
      susCard: "104992838400119",
      birthDate: new Date("1988-06-25"),
      phone: "(98) 98144-8899",
      priority: Priority.NORMAL,
      priorityLabel: "Atendimento Convencional (Normal)",
      specialCondition: "Comum",
    },
  });

  const pUrgente = await prisma.patient.create({
    data: {
      name: "Gabriel Albuquerque Rios",
      cpf: "219.004.811-09",
      susCard: "700998811220033",
      birthDate: new Date("2001-08-15"),
      phone: "(98) 98800-4455",
      priority: Priority.URGENTE,
      priorityLabel: "Urgência (Triagem Manchester)",
      specialCondition: "Urgência",
    },
  });

  console.log("✅ Pacientes criados com sucesso.");

  // 5. Criar Senhas na Fila
  // a) Senha Urgente Aguardando
  await prisma.ticket.create({
    data: {
      code: "URG-001",
      patientId: pUrgente.id,
      patientName: pUrgente.name,
      cpf: pUrgente.cpf,
      cartaoSus: pUrgente.susCard,
      priority: Priority.URGENTE,
      priorityWeight: 4,
      priorityLabel: "Urgência (Triagem Manchester)",
      service: ServiceType.TRIAGEM,
      serviceLabel: "Triagem",
      status: QueueStatus.AGUARDANDO,
      room: room4.name,
      roomId: room4.id,
      notes: "Cefaleia súbita e pressão 18/11 aferida na recepção",
      createdAt: new Date(Date.now() - 5 * 60000),
    },
  });

  // b) Senha Superprioridade 80+ Aguardando
  await prisma.ticket.create({
    data: {
      code: "PRE-001",
      patientId: pBenedita.id,
      patientName: pBenedita.name,
      cpf: pBenedita.cpf,
      cartaoSus: pBenedita.susCard,
      priority: Priority.PREFERENCIAL,
      priorityWeight: 3,
      priorityLabel: "Superprioridade 80+",
      service: ServiceType.CLINICO_GERAL,
      serviceLabel: "Clínico Geral",
      status: QueueStatus.AGUARDANDO,
      room: room2.name,
      roomId: room2.id,
      createdAt: new Date(Date.now() - 15 * 60000),
    },
  });

  // c) Senha Gestante Aguardando
  await prisma.ticket.create({
    data: {
      code: "PRE-002",
      patientId: pJuliana.id,
      patientName: pJuliana.name,
      cpf: pJuliana.cpf,
      cartaoSus: pJuliana.susCard,
      priority: Priority.PREFERENCIAL,
      priorityWeight: 2,
      priorityLabel: "Prioritário (Gestante)",
      service: ServiceType.GINECOLOGIA,
      serviceLabel: "Ginecologia / Pré-Natal",
      status: QueueStatus.AGUARDANDO,
      createdAt: new Date(Date.now() - 12 * 60000),
    },
  });

  // d) Senha Convencional Aguardando
  await prisma.ticket.create({
    data: {
      code: "NOR-001",
      patientId: pCarlos.id,
      patientName: pCarlos.name,
      cpf: pCarlos.cpf,
      cartaoSus: pCarlos.susCard,
      priority: Priority.NORMAL,
      priorityWeight: 1,
      priorityLabel: "Atendimento Convencional (Normal)",
      service: ServiceType.CLINICO_GERAL,
      serviceLabel: "Clínico Geral",
      status: QueueStatus.AGUARDANDO,
      createdAt: new Date(Date.now() - 10 * 60000),
    },
  });

  // e) Senha Chamando no Painel TV
  await prisma.ticket.create({
    data: {
      code: "PRE-003",
      patientId: pMariaHelena.id,
      patientName: pMariaHelena.name,
      cpf: pMariaHelena.cpf,
      cartaoSus: pMariaHelena.susCard,
      priority: Priority.PREFERENCIAL,
      priorityWeight: 2,
      priorityLabel: "Prioritário (Idoso 60+)",
      service: ServiceType.CLINICO_GERAL,
      serviceLabel: "Clínico Geral",
      status: QueueStatus.CHAMANDO,
      room: room1.name,
      roomId: room1.id,
      professional: medica.name,
      userId: medica.id,
      calledAt: new Date(Date.now() - 2 * 60000),
      createdAt: new Date(Date.now() - 25 * 60000),
    },
  });

  // f) Senha Em Atendimento
  await prisma.ticket.create({
    data: {
      code: "PRE-004",
      patientId: pLucas.id,
      patientName: pLucas.name,
      cpf: pLucas.cpf,
      cartaoSus: pLucas.susCard,
      priority: Priority.PREFERENCIAL,
      priorityWeight: 2,
      priorityLabel: "Prioritário (PCD)",
      service: ServiceType.ODONTOLOGIA,
      serviceLabel: "Odontologia",
      status: QueueStatus.EM_ATENDIMENTO,
      room: room3.name,
      roomId: room3.id,
      professional: "Dra. Vanessa Prado",
      calledAt: new Date(Date.now() - 15 * 60000),
      attendedAt: new Date(Date.now() - 10 * 60000),
      waitTimeMinutes: 14,
      createdAt: new Date(Date.now() - 29 * 60000),
    },
  });

  // g) Senha Finalizada com CID (para Histórico e Estatísticas)
  await prisma.ticket.create({
    data: {
      code: "NOR-000",
      patientId: pCarlos.id,
      patientName: "Ana Paula Souza",
      cpf: "334.209.811-77",
      cartaoSus: "700889922110044",
      priority: Priority.NORMAL,
      priorityWeight: 1,
      priorityLabel: "Atendimento Convencional (Normal)",
      service: ServiceType.GINECOLOGIA,
      serviceLabel: "Ginecologia",
      status: QueueStatus.FINALIZADO,
      room: "Sala 03",
      professional: "Dra. Fernanda Lopes",
      cid: "Z01.4 — Exame ginecológico de rotina",
      notes: "Paciente assintomática, coleta de preventivo realizada com sucesso.",
      waitTimeMinutes: 18,
      consultationTimeMinutes: 22,
      createdAt: new Date(Date.now() - 90 * 60000),
      calledAt: new Date(Date.now() - 72 * 60000),
      attendedAt: new Date(Date.now() - 70 * 60000),
      finishedAt: new Date(Date.now() - 48 * 60000),
    },
  });

  // h) Senha Ausente
  await prisma.ticket.create({
    data: {
      code: "NOR-002",
      patientId: pCarlos.id,
      patientName: "Marcos Vinicius Pereira",
      cpf: "542.889.102-19",
      cartaoSus: "700112233445566",
      priority: Priority.NORMAL,
      priorityWeight: 1,
      priorityLabel: "Atendimento Convencional (Normal)",
      service: ServiceType.CLINICO_GERAL,
      serviceLabel: "Clínico Geral",
      status: QueueStatus.AUSENTE,
      room: "Sala 02",
      professional: medica.name,
      notes: "Paciente chamado 3 vezes sem comparecimento.",
      createdAt: new Date(Date.now() - 120 * 60000),
      calledAt: new Date(Date.now() - 100 * 60000),
      finishedAt: new Date(Date.now() - 95 * 60000),
    },
  });

  console.log("🎉 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
