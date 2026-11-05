import http from "http";
import app from "../src/app";
import { Server } from "socket.io";
import { initQueueSocket } from "../src/sockets/queue.socket";
import { io as ClientIO } from "socket.io-client";

const PORT = 3099;

async function runTests() {
  console.log("🧪 Iniciando Bateria de Testes Automatizados E2E FilaFácil Backend...");

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });
  initQueueSocket(io);

  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));
  console.log(`🌐 Servidor de testes ativo na porta ${PORT}`);

  const baseUrl = `http://localhost:${PORT}`;

  let passed = 0;
  let failed = 0;

  async function assert(desc: string, fn: () => Promise<boolean | void>) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${desc}:`, err.message || err);
      failed++;
    }
  }

  // 1. WebSocket Conectividade e Eventos
  let socketClient: any;
  const receivedEvents: string[] = [];

  await assert("Socket.IO: Conectar e escutar eventos da fila", async () => {
    socketClient = ClientIO(baseUrl, { transports: ["websocket"] });
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout ao conectar socket")), 3000);
      socketClient.on("connect", () => {
        clearTimeout(timeout);
        socketClient.emit("join-queue", "general-queue");
        socketClient.on("ticket:called", () => receivedEvents.push("ticket:called"));
        socketClient.on("ticket:status-updated", () => receivedEvents.push("ticket:status-updated"));
        socketClient.on("queue:metrics-updated", () => receivedEvents.push("queue:metrics-updated"));
        resolve();
      });
    });
  });

  // 2. Healthcheck
  await assert("Healthcheck /health retorna status ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== "ok") throw new Error("Healthcheck falhou");
  });

  function generateRandomValidCPF(): string {
    const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    let d1 = n.reduce((total, num, i) => total + num * (10 - i), 0) % 11;
    d1 = d1 < 2 ? 0 : 11 - d1;
    let d2 = [...n, d1].reduce((total, num, i) => total + num * (11 - i), 0) % 11;
    d2 = d2 < 2 ? 0 : 11 - d2;
    return `${n[0]}${n[1]}${n[2]}.${n[3]}${n[4]}${n[5]}.${n[6]}${n[7]}${n[8]}-${d1}${d2}`;
  }

  // 3. Autenticação: Registro de Operador com CPF Válido
  let authToken = "";
  let operatorId = "";
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const testEmail = `operador${randomSuffix}@filafacil.ubs`;
  const validTestCpf = generateRandomValidCPF();

  await assert("Auth: Registro de novo operador (POST /api/auth/register)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dr. Teste Automatizado",
        cpf: validTestCpf,
        email: testEmail,
        password: "senhaSegura123",
        role: "MEDICO",
        unit: "UBS Centro - Dr. José Silva",
        phone: "(98) 98888-0099",
        registrationNumber: "CRM-MA 99.888",
        acceptedTerms: true,
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.token) {
      throw new Error(`Falha no registro: ${JSON.stringify(data)}`);
    }
    authToken = data.token;
    operatorId = data.user.id;
  });

  // 4. Autenticação: Login por E-mail e por CPF
  await assert("Auth: Login com e-mail (POST /api/auth/login)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "senhaSegura123",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.token) throw new Error("Falha no login por email");
  });

  await assert("Auth: Login com CPF (POST /api/auth/login)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cpf: validTestCpf,
        password: "senhaSegura123",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.token) throw new Error("Falha no login por CPF");
  });

  // 5. Perfil do Operador
  await assert("Users: Consultar perfil (GET /api/users/profile)", async () => {
    const res = await fetch(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || data.email !== testEmail) throw new Error("Perfil incorreto");
  });

  await assert("Users: Atualizar dados cadastrais (PUT /api/users/profile)", async () => {
    const res = await fetch(`${baseUrl}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        phone: "(98) 99999-7777",
        unit: "UBS Jardim das Flores",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.profile.unit !== "UBS Jardim das Flores") {
      throw new Error("Falha na atualização de perfil");
    }
  });

  // 6. Pacientes: CADSUS Search e Criação
  await assert("Patients: Busca integrada CADSUS (GET /api/patients/search?q=Maria)", async () => {
    const res = await fetch(`${baseUrl}/api/patients/search?q=Maria`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data) || data.length === 0) {
      throw new Error("Busca CADSUS vazia");
    }
  });

  let createdPatientId = "";
  await assert("Patients: Cadastro de novo cidadão (POST /api/patients)", async () => {
    const res = await fetch(`${baseUrl}/api/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Antônio Ferreira Santos",
        cpf: "847.219.004-91",
        susCard: "700998844332211",
        birthDate: "1940-06-12",
        phone: "(98) 98122-3344",
        specialCondition: "Idoso 80+",
        priority: "PREFERENCIAL",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.patient.id) throw new Error("Falha ao cadastrar paciente");
    createdPatientId = data.patient.id;
  });

  // 7. Salas: Listagem e Associação de Profissional
  let testRoomId = "";
  await assert("Rooms: Listar salas de atendimento (GET /api/rooms)", async () => {
    const res = await fetch(`${baseUrl}/api/rooms`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data) || data.length === 0) {
      throw new Error("Nenhuma sala retornada");
    }
    testRoomId = data[0].id;
  });

  await assert("Rooms: Vincular profissional à sala (POST /api/rooms/:id/assign)", async () => {
    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        professionalName: "Dr. Teste Automatizado",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.room.assignedProfessional !== "Dr. Teste Automatizado") {
      throw new Error("Falha ao vincular profissional");
    }
  });

  // 8. Motor de Filas: Emissão de Senhas com QR Code e Prioridades SUS
  let urgTicketId = "";
  let preTicketId = "";
  let norTicketId = "";

  await assert("Tickets: Emissão de Senha URGENTE (POST /api/tickets)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: "Paciente Urgência Manchester",
        priority: "URGENTE",
        service: "Triagem",
        notes: "Dor torácica aguda",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.ticket.code.startsWith("URG") || !data.receipt.qrPayload) {
      throw new Error("Falha ao emitir senha URGENTE com QR Code");
    }
    urgTicketId = data.ticket.id;
  });

  await assert("Tickets: Emissão de Senha PREFERENCIAL 80+ (POST /api/tickets)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: createdPatientId,
        patientName: "Antônio Ferreira Santos",
        priority: "PREFERENCIAL",
        specialCondition: "Idoso 80+",
        service: "Clínico Geral",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.ticket.code.startsWith("PRE") || data.ticket.priorityWeight !== 3) {
      throw new Error("Falha ao emitir senha PREFERENCIAL 80+ com peso 3");
    }
    preTicketId = data.ticket.id;
  });

  await assert("Tickets: Emissão de Senha CONVENCIONAL via /api/queue (POST /api/queue)", async () => {
    const res = await fetch(`${baseUrl}/api/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: "Paciente Normal Comum",
        priority: "NORMAL",
        service: "Odontologia",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.ticket.code.startsWith("NOR") || data.ticket.priorityWeight !== 1) {
      throw new Error("Falha ao emitir senha CONVENCIONAL via rota /api/queue");
    }
    norTicketId = data.ticket.id;
  });

  await assert("Tickets: Emissão com data e horário agendado (POST /api/tickets)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: "Paciente Agendado Calendário",
        priority: "NORMAL",
        service: "Clínico Geral",
        selectedDate: "24/10/2026",
        selectedTime: "10:00",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.ticket.scheduledAt) {
      throw new Error("Falha ao registrar ticket com data/horário agendado");
    }
  });

  // 9. Fila de Espera Legal do SUS Ordenada
  await assert("Tickets: Ordenação legal da fila SUS (GET /api/tickets/waiting)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets/waiting`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data)) throw new Error("Fila inválida");
    // Primeiro deve ter prioridade máxima (URGENTE peso 4)
    if (data[0].priorityWeight < 4) {
      throw new Error(`Primeiro da fila deveria ser Urgência peso 4, obteve peso ${data[0].priorityWeight}`);
    }
  });

  // 10. Chamada de Paciente, Início, Término e Ausência
  await assert("Tickets: Chamar próximo paciente da fila (POST /api/tickets/call-next)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets/call-next`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        roomId: testRoomId,
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.ticket.status !== "CHAMANDO") {
      throw new Error("Falha ao chamar próximo paciente");
    }
  });

  await assert("Tickets: Rechamar senha no painel TV (POST /api/tickets/:id/recall)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets/${urgTicketId}/recall`, {
      method: "POST",
    });
    const data = await res.json();
    if (res.status !== 200 || data.ticket.status !== "CHAMANDO") {
      throw new Error("Falha ao rechamar senha");
    }
  });

  await assert("Tickets: Iniciar atendimento clínico (POST /api/tickets/:id/start)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets/${urgTicketId}/start`, {
      method: "POST",
    });
    const data = await res.json();
    if (res.status !== 200 || data.ticket.status !== "EM_ATENDIMENTO") {
      throw new Error("Falha ao iniciar atendimento");
    }
  });

  await assert("Tickets: Finalizar atendimento com CID (POST /api/tickets/:id/finish)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets/${urgTicketId}/finish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cid: "I10 — Hipertensão essencial",
        notes: "Pressão normalizada com medicação na sala de medicação.",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.ticket.status !== "FINALIZADO" || !data.ticket.cid) {
      throw new Error("Falha ao finalizar atendimento com CID");
    }
  });

  await assert("Tickets: Marcar paciente como ausente (POST /api/tickets/:id/absent)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets/${norTicketId}/absent`, {
      method: "POST",
    });
    const data = await res.json();
    if (res.status !== 200 || data.ticket.status !== "AUSENTE") {
      throw new Error("Falha ao marcar paciente ausente");
    }
  });

  // 11. Endpoints de Apoio para TV
  await assert("TV: Obter chamada ativa atual (GET /api/tv/current-call)", async () => {
    const res = await fetch(`${baseUrl}/api/tv/current-call`);
    const data = await res.json();
    if (res.status !== 200) throw new Error("Falha em GET /api/tv/current-call");
  });

  await assert("TV: Próximas senhas previstas com horário (GET /api/tv/upcoming)", async () => {
    const res = await fetch(`${baseUrl}/api/tv/upcoming`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data)) throw new Error("Falha em GET /api/tv/upcoming");
  });

  // 12. Estatísticas e Relatórios
  await assert("Stats: Métricas do Dashboard em tempo real (GET /api/stats/dashboard)", async () => {
    const res = await fetch(`${baseUrl}/api/stats/dashboard`);
    const data = await res.json();
    if (
      res.status !== 200 ||
      typeof data.totalWaiting !== "number" ||
      typeof data.averageWaitMinutes !== "number" ||
      typeof data.isSusTargetMet !== "boolean"
    ) {
      throw new Error("Métricas do dashboard inválidas");
    }
  });

  await assert("Stats: Relatórios analíticos por período (GET /api/stats/reports?period=week)", async () => {
    const res = await fetch(`${baseUrl}/api/stats/reports?period=week`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.bySpecialty) || !Array.isArray(data.hourlyDistribution)) {
      throw new Error("Relatórios analíticos inválidos");
    }
  });

  await assert("Stats: Exportação consolidada em PDF (GET /api/stats/export?format=pdf)", async () => {
    const res = await fetch(`${baseUrl}/api/stats/export?format=pdf`);
    if (res.status !== 200 || res.headers.get("content-type") !== "application/pdf") {
      throw new Error("Exportação PDF falhou");
    }
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 100) throw new Error("Buffer PDF gerado está vazio");
  });

  // 13. Histórico e Linha do Tempo
  await assert("History: Consulta retroativa (GET /api/history)", async () => {
    const res = await fetch(`${baseUrl}/api/history`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.records) || data.records.length === 0) {
      throw new Error("Histórico vazio ou inválido");
    }
  });

  await assert("History: Detalhes com linha do tempo clínica (GET /api/history/:id)", async () => {
    const res = await fetch(`${baseUrl}/api/history/${urgTicketId}`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.timeline) || data.timeline.length < 3) {
      throw new Error("Linha do tempo clínica incompleta");
    }
  });

  await assert("History: Exportação CSV (GET /api/history/export)", async () => {
    const res = await fetch(`${baseUrl}/api/history/export`);
    if (res.status !== 200 || !res.headers.get("content-type")?.includes("csv")) {
      throw new Error("Exportação CSV do histórico falhou");
    }
    const text = await res.text();
    if (!text.includes("Senha") || !text.includes("Nome do Paciente")) {
      throw new Error("Cabeçalho CSV inválido");
    }
  });

  // 14. Exportação da Fila em CSV
  await assert("Tickets: Exportação da fila em CSV (GET /api/tickets/export)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets/export`);
    if (res.status !== 200 || !res.headers.get("content-type")?.includes("csv")) {
      throw new Error("Exportação CSV da fila falhou");
    }
  });

  // 15. Validação Específica de Filtros Avançados
  await assert("Filtros: Fila por status AGUARDANDO (GET /api/tickets?status=AGUARDANDO)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets?status=AGUARDANDO`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.tickets)) throw new Error("Filtro por status falhou");
    const nonWaiting = data.tickets.filter((t: any) => t.status !== "AGUARDANDO");
    if (nonWaiting.length > 0) throw new Error("Retornou itens com status diferente de AGUARDANDO");
  });

  await assert("Filtros: Fila por especialidade (GET /api/tickets?specialty=Odontologia)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets?specialty=Odontologia`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.tickets)) throw new Error("Filtro por especialidade falhou");
    const mismatch = data.tickets.filter((t: any) => t.service !== "ODONTOLOGIA");
    if (mismatch.length > 0) throw new Error("Retornou itens com especialidade diferente de ODONTOLOGIA");
  });

  await assert("Filtros: Fila por prioridade (GET /api/tickets?priority=PREFERENCIAL)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets?priority=PREFERENCIAL`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.tickets)) throw new Error("Filtro por prioridade falhou");
    const mismatch = data.tickets.filter((t: any) => t.priority !== "PREFERENCIAL");
    if (mismatch.length > 0) throw new Error("Retornou itens com prioridade diferente de PREFERENCIAL");
  });

  await assert("Filtros: Fila por busca textual (GET /api/tickets?search=Antônio)", async () => {
    const res = await fetch(`${baseUrl}/api/tickets?search=Ant%C3%B4nio`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.tickets) || data.tickets.length === 0) {
      throw new Error("Busca textual na fila não encontrou o paciente cadastrado");
    }
  });

  await assert("Filtros: Histórico por período relativo (GET /api/history?period=hoje)", async () => {
    const res = await fetch(`${baseUrl}/api/history?period=hoje`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.records)) throw new Error("Filtro de histórico por hoje falhou");
  });

  await assert("Filtros: Histórico por status Atendido (GET /api/history?status=Atendido)", async () => {
    const res = await fetch(`${baseUrl}/api/history?status=Atendido`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.records)) throw new Error("Filtro de histórico por status falhou");
    const nonAttended = data.records.filter((r: any) => r.status !== "Atendido");
    if (nonAttended.length > 0) throw new Error("Retornou registros que não estão Atendido");
  });

  // 16. WebSocket Eventos Recebidos
  await assert("Socket.IO: Validar eventos emitidos durante os testes", async () => {
    // Dá 500ms para mensagens chegarem no cliente socket
    await new Promise((r) => setTimeout(r, 500));
    if (receivedEvents.length === 0) {
      throw new Error("Nenhum evento socket foi interceptado pelo cliente");
    }
    console.log(`    Eventos capturados pelo cliente Socket.IO: ${[...new Set(receivedEvents)].join(", ")}`);
  });

  socketClient.disconnect();
  server.close();

  console.log("\n==============================================");
  console.log(`🎯 RESULTADO DOS TESTES: ${passed} PASSOU, ${failed} FALHOU`);
  console.log("==============================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Erro fatal nos testes:", e);
  process.exit(1);
});
