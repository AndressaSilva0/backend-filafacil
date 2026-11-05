export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "🏥 FilaFácil UBS - API REST & WebSockets",
    version: "1.0.0",
    description: `
**Sistema de Gerenciamento de Filas e Triagem para Unidades Básicas de Saúde (SUS)**

Esta API gerencia o ciclo completo de acolhimento na Atenção Primária à Saúde:
- **Autenticação e Operadores**: Login seguro JWT, perfis e termos do SUS.
- **Pacientes e CADSUS**: Busca unificada e cadastro com condições clínicas.
- **Motor de Filas**: Classificação de risco e prioridades legais do SUS (Manchester, Idoso 80+, Prioridade Geral 60+/Gestante/PCD, Convencional).
- **Consultórios e Salas**: Alocação de médicos e enfermeiros.
- **Painel TV**: Consulta da chamada ativa e próximas senhas previstas.
- **Métricas e Relatórios**: Tempo médio de espera, meta de 20 min do SUS e relatórios analíticos em PDF/CSV.
- **Histórico e Auditoria**: Rastreamento completo de cada atendimento.
    `,
    contact: {
      name: "Alpha Company - IFMA",
      url: "https://github.com/AndressaSilva0/backend-filafacil",
    },
    license: {
      name: "Projeto Acadêmico IFMA",
    },
  },
  servers: [
    {
      url: "https://backend-filafacil.onrender.com",
      description: "Servidor em Produção (Render)",
    },
    {
      url: "http://localhost:3001",
      description: "Servidor Local (Desenvolvimento)",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira o token JWT obtido no endpoint de login (/api/auth/login)",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Mensagem descritiva do erro" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c" },
          name: { type: "string", example: "Dra. Juliana Mendes" },
          email: { type: "string", example: "juliana.mendes@ubs.saude.gov.br" },
          cpf: { type: "string", example: "512.774.920-33" },
          phone: { type: "string", example: "(98) 98877-6655" },
          role: { type: "string", example: "MEDICO" },
          cns: { type: "string", example: "712982311020049" },
          unitName: { type: "string", example: "UBS Vila Esperança" },
          registration: { type: "string", example: "CRM-MA 12345" },
          avatarUrl: { type: "string", nullable: true, example: "/uploads/avatars/avatar-1.png" },
        },
      },
      Patient: {
        type: "object",
        properties: {
          id: { type: "string", example: "p1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c" },
          name: { type: "string", example: "Benedita Souza Costa" },
          cpf: { type: "string", example: "389.220.198-10" },
          cartaoSus: { type: "string", example: "892441029810001" },
          birthDate: { type: "string", format: "date", example: "1940-03-12" },
          phone: { type: "string", example: "(98) 99123-4567" },
          gender: { type: "string", example: "F" },
          priorityGroup: { type: "string", example: "PREFERENCIAL_80" },
          conditions: {
            type: "array",
            items: { type: "string" },
            example: ["HIPERTENSAO", "DIABETES"],
          },
        },
      },
      Ticket: {
        type: "object",
        properties: {
          id: { type: "string", example: "t1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c" },
          code: { type: "string", example: "PRE-001" },
          patientName: { type: "string", example: "Benedita Souza Costa" },
          cpf: { type: "string", example: "389.220.198-10" },
          cartaoSus: { type: "string", example: "892441029810001" },
          priority: {
            type: "string",
            enum: ["NORMAL", "PREFERENCIAL_60", "PREFERENCIAL_80", "GESTANTE", "PCD", "URGENCIA_MANCHESTER"],
            example: "PREFERENCIAL_80",
          },
          status: {
            type: "string",
            enum: ["WAITING", "CALLED", "IN_PROGRESS", "FINISHED", "ABSENT", "CANCELLED"],
            example: "WAITING",
          },
          specialty: { type: "string", example: "Clinica Geral" },
          roomName: { type: "string", nullable: true, example: "Consultorio 01" },
          doctorName: { type: "string", nullable: true, example: "Dra. Juliana Mendes" },
          calledAt: { type: "string", nullable: true, format: "date-time" },
          startedAt: { type: "string", nullable: true, format: "date-time" },
          finishedAt: { type: "string", nullable: true, format: "date-time" },
          waitTimeMinutes: { type: "number", nullable: true, example: 14 },
          serviceDurationMinutes: { type: "number", nullable: true, example: 18 },
          cid10: { type: "string", nullable: true, example: "I10" },
          notes: { type: "string", nullable: true, example: "Consulta de rotina realizada com sucesso." },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Room: {
        type: "object",
        properties: {
          id: { type: "string", example: "r1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c" },
          name: { type: "string", example: "Consultorio 01" },
          specialty: { type: "string", example: "Clinica Geral" },
          status: { type: "string", enum: ["DISPONIVEL", "OCUPADO", "MANUTENCAO"], example: "DISPONIVEL" },
          currentDoctor: { type: "string", nullable: true, example: "Dra. Juliana Mendes" },
        },
      },
    },
  },
  tags: [
    { name: "Sistema", description: "Status operacional e informações gerais" },
    { name: "Autenticação", description: "Login, registro e recuperação de credenciais de operadores" },
    { name: "Usuários & Perfil", description: "Gerenciamento de perfil profissional, crachá e avatares" },
    { name: "Pacientes (CADSUS)", description: "Busca unificada e cadastro de usuários do SUS" },
    { name: "Fila & Senhas", description: "Emissão de tickets, triagem, chamadas e ciclo de atendimento" },
    { name: "Salas & Consultórios", description: "Gerenciamento de salas e alocação de profissionais" },
    { name: "Painel TV", description: "Endpoints em tempo real para telas de chamada na recepção" },
    { name: "Métricas & Relatórios", description: "Indicadores de desempenho, tempo de espera e exportações" },
    { name: "Histórico & Auditoria", description: "Consulta retroativa e auditoria de atendimentos" },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Sistema"],
        summary: "Página inicial da API",
        description: "Retorna o status online do serviço e o catálogo de rotas disponíveis.",
        responses: {
          200: {
            description: "Status da API com sucesso",
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Health Check",
        description: "Endpoint leve para monitoramento de disponibilidade e integridade do banco.",
        responses: {
          200: {
            description: "Serviço operacional",
            content: {
              "application/json": {
                example: {
                  status: "ok",
                  service: "FilaFacil UBS Backend",
                  timestamp: "2026-11-05T19:00:00.000Z",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Autenticação"],
        summary: "Autenticação do Operador",
        description: "Realiza o login por E-mail ou CPF (com ou sem pontuação) com senha e devolve o token JWT.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["login", "password"],
                properties: {
                  login: {
                    type: "string",
                    description: "E-mail ou CPF (com ou sem pontuação)",
                    example: "recepcao@filafacil.ubs",
                  },
                  password: { type: "string", example: "senha123" },
                  rememberMe: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login efetuado com sucesso",
            content: {
              "application/json": {
                example: {
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  user: {
                    id: "c1a2b3...",
                    name: "Andressa Silva",
                    email: "andressa.silva@ubs.saude.gov.br",
                    role: "RECEPCAO",
                  },
                },
              },
            },
          },
          401: {
            description: "Credenciais inválidas",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Autenticação"],
        summary: "Cadastro de Novo Operador",
        description: "Registra um profissional ou recepcionista com validação de CPF e termos.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "cpf", "password", "termsAccepted"],
                properties: {
                  name: { type: "string", example: "Carlos Eduardo Silveira" },
                  email: { type: "string", example: "carlos.silveira@ubs.saude.gov.br" },
                  cpf: { type: "string", example: "612.339.401-22" },
                  password: { type: "string", example: "SenhaForte123!" },
                  phone: { type: "string", example: "(98) 98765-4321" },
                  role: { type: "string", example: "ENFERMEIRO" },
                  cns: { type: "string", example: "104992838400119" },
                  unitName: { type: "string", example: "UBS Central" },
                  registration: { type: "string", example: "COREN-MA 65432" },
                  termsAccepted: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Operador cadastrado com sucesso" },
          400: { description: "Dados inválidos ou CPF já cadastrado" },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Autenticação"],
        summary: "Solicitar Recuperação de Senha",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["emailOrCpf"],
                properties: {
                  emailOrCpf: { type: "string", example: "andressa.silva@ubs.saude.gov.br" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Instruções ou token de recuperação gerado" },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Autenticação"],
        summary: "Redefinir Senha com Token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "newPassword"],
                properties: {
                  token: { type: "string", example: "reset-token-xyz" },
                  newPassword: { type: "string", example: "NovaSenhaForte2026!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Senha redefinida com sucesso" },
          400: { description: "Token inválido ou expirado" },
        },
      },
    },
    "/api/users/profile": {
      get: {
        tags: ["Usuários & Perfil"],
        summary: "Consultar Perfil do Operador Logado",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Dados cadastrais e funcionais do operador",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          401: { description: "Não autorizado" },
        },
      },
      put: {
        tags: ["Usuários & Perfil"],
        summary: "Atualizar Dados do Perfil",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Andressa Silva Pereira" },
                  phone: { type: "string", example: "(98) 98888-7777" },
                  role: { type: "string", example: "COORDENADORA" },
                  unitName: { type: "string", example: "UBS Vila Esperança" },
                  registration: { type: "string", example: "MAT-2026" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Perfil atualizado com sucesso" },
        },
      },
    },
    "/api/users/change-password": {
      put: {
        tags: ["Usuários & Perfil"],
        summary: "Alterar Senha do Operador",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string", example: "SenhaAtual123!" },
                  newPassword: { type: "string", example: "NovaSenhaForte123!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Senha alterada com sucesso" },
          400: { description: "Senha atual incorreta" },
        },
      },
    },
    "/api/patients/search": {
      get: {
        tags: ["Pacientes (CADSUS)"],
        summary: "Busca Rápida Unificada (CADSUS)",
        description: "Pesquisa pacientes por Nome, CPF ou Cartão SUS (CNS).",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description: "Termo de busca (ex: 'Benedita', '389.220' ou '8924410')",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Lista de pacientes localizados",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Patient" } },
              },
            },
          },
        },
      },
    },
    "/api/patients": {
      get: {
        tags: ["Pacientes (CADSUS)"],
        summary: "Listar Todos os Pacientes",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: { description: "Lista paginada de pacientes" },
        },
      },
      post: {
        tags: ["Pacientes (CADSUS)"],
        summary: "Cadastrar Novo Paciente",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Maria Helena Cavalcanti" },
                  cpf: { type: "string", example: "489.201.782-90" },
                  cartaoSus: { type: "string", example: "702409188320019" },
                  birthDate: { type: "string", format: "date", example: "1942-05-18" },
                  phone: { type: "string", example: "(98) 98122-3344" },
                  priorityGroup: { type: "string", example: "PREFERENCIAL_80" },
                  conditions: {
                    type: "array",
                    items: { type: "string" },
                    example: ["HIPERTENSAO"],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Paciente cadastrado com sucesso" },
        },
      },
    },
    "/api/tickets": {
      post: {
        tags: ["Fila & Senhas"],
        summary: "Emitir Nova Senha na Fila (Triagem)",
        description: "Gera o código sequencial diário (URG-001, PRE-001, NOR-001), comprovante térmico e QR Code.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientName", "priority"],
                properties: {
                  patientName: { type: "string", example: "Benedita Souza Costa" },
                  cpf: { type: "string", example: "389.220.198-10" },
                  cartaoSus: { type: "string", example: "892441029810001" },
                  priority: {
                    type: "string",
                    enum: ["NORMAL", "PREFERENCIAL_60", "PREFERENCIAL_80", "GESTANTE", "PCD", "URGENCIA_MANCHESTER"],
                    example: "PREFERENCIAL_80",
                  },
                  specialty: { type: "string", example: "Clinica Geral" },
                  notes: { type: "string", example: "Paciente queixa-se de dores lombares." },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Senha gerada com comprovante",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } },
          },
        },
      },
      get: {
        tags: ["Fila & Senhas"],
        summary: "Listar Fila com Filtros",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", example: "WAITING" } },
          { name: "specialty", in: "query", schema: { type: "string" } },
          { name: "roomId", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Lista de senhas filtradas",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Ticket" } },
              },
            },
          },
        },
      },
    },
    "/api/tickets/waiting": {
      get: {
        tags: ["Fila & Senhas"],
        summary: "Consultar Fila Ordenada por Prioridade Legal do SUS",
        description: "Ordena estritamente por: Manchester > Idoso 80+ > Idoso 60+/Gestante/PCD > Convencional (FIFO).",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Fila de espera priorizada",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Ticket" } },
              },
            },
          },
        },
      },
    },
    "/api/tickets/call-next": {
      post: {
        tags: ["Fila & Senhas"],
        summary: "Chamar Próximo Paciente da Fila",
        description: "Chama automaticamente a senha de maior prioridade para a sala indicada e emite WebSocket.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["roomName"],
                properties: {
                  roomName: { type: "string", example: "Consultorio 01" },
                  doctorName: { type: "string", example: "Dra. Juliana Mendes" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Paciente chamado com sucesso",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } },
          },
          404: { description: "Nenhum paciente aguardando na fila" },
        },
      },
    },
    "/api/tickets/{id}/call": {
      post: {
        tags: ["Fila & Senhas"],
        summary: "Chamar Senha Específica",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["roomName"],
                properties: {
                  roomName: { type: "string", example: "Consultorio 01" },
                  doctorName: { type: "string", example: "Dra. Juliana Mendes" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Senha chamada" } },
      },
    },
    "/api/tickets/{id}/recall": {
      post: {
        tags: ["Fila & Senhas"],
        summary: "Rechamar Senha",
        description: "Dispara novo alerta sonoro e visual no Painel da TV.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Senha rechamada" } },
      },
    },
    "/api/tickets/{id}/start": {
      post: {
        tags: ["Fila & Senhas"],
        summary: "Iniciar Atendimento no Consultório",
        description: "Altera status para IN_PROGRESS e registra tempo de início.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Atendimento iniciado" } },
      },
    },
    "/api/tickets/{id}/finish": {
      post: {
        tags: ["Fila & Senhas"],
        summary: "Finalizar Atendimento",
        description: "Calcula tempos de espera/consulta e permite registrar anotações e CID-10.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  notes: { type: "string", example: "Paciente medicado e orientado." },
                  cid10: { type: "string", example: "I10" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Atendimento finalizado" } },
      },
    },
    "/api/tickets/{id}/absent": {
      post: {
        tags: ["Fila & Senhas"],
        summary: "Marcar Paciente como Ausente",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Marcado como ausente" } },
      },
    },
    "/api/tickets/export": {
      get: {
        tags: ["Fila & Senhas"],
        summary: "Exportar Fila Diária em CSV",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Download do arquivo CSV da fila diária",
            content: { "text/csv": {} },
          },
        },
      },
    },
    "/api/rooms": {
      get: {
        tags: ["Salas & Consultórios"],
        summary: "Listar Consultórios e Salas",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Lista de salas",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Room" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Salas & Consultórios"],
        summary: "Criar Nova Sala ou Consultório",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "specialty"],
                properties: {
                  name: { type: "string", example: "Consultorio 05" },
                  specialty: { type: "string", example: "Pediatria" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Sala criada com sucesso" } },
      },
    },
    "/api/tv/current-call": {
      get: {
        tags: ["Painel TV"],
        summary: "Consultar Chamada Ativa Atual para a TV",
        description: "Utilizado pelo painel da recepção para exibir a última senha chamada.",
        responses: {
          200: {
            description: "Chamada ativa ou null se nenhuma ativa",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ticket" },
              },
            },
          },
        },
      },
    },
    "/api/tv/upcoming": {
      get: {
        tags: ["Painel TV"],
        summary: "Consultar Próximas Senhas Previstas",
        description: "Lista as próximas senhas que serão chamadas com previsão de espera.",
        responses: {
          200: {
            description: "Lista de próximas senhas",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Ticket" } },
              },
            },
          },
        },
      },
    },
    "/api/stats/dashboard": {
      get: {
        tags: ["Métricas & Relatórios"],
        summary: "Obter Indicadores em Tempo Real para o Dashboard",
        description: "Métricas consolidadas de aguardando, tempo médio de espera, taxa de ausência e meta SUS.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Estatísticas do dia",
            content: {
              "application/json": {
                example: {
                  waitingCount: 5,
                  inProgressCount: 2,
                  finishedTodayCount: 18,
                  absentCount: 1,
                  averageWaitTimeMinutes: 14.5,
                  withinSusGoalPercentage: 92.5,
                  byPriority: {
                    NORMAL: 2,
                    PREFERENCIAL_60: 1,
                    PREFERENCIAL_80: 1,
                    URGENCIA_MANCHESTER: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/stats/reports": {
      get: {
        tags: ["Métricas & Relatórios"],
        summary: "Relatórios Analíticos por Período",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "period",
            in: "query",
            schema: { type: "string", enum: ["today", "week", "month"], default: "today" },
          },
        ],
        responses: { 200: { description: "Dados analíticos do período" } },
      },
    },
    "/api/stats/export": {
      get: {
        tags: ["Métricas & Relatórios"],
        summary: "Exportar Relatório Consolidado em PDF ou CSV",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "format",
            in: "query",
            schema: { type: "string", enum: ["pdf", "csv"], default: "pdf" },
          },
        ],
        responses: {
          200: { description: "Download do arquivo PDF ou CSV gerado" },
        },
      },
    },
    "/api/history": {
      get: {
        tags: ["Histórico & Auditoria"],
        summary: "Consultar Histórico Retroativo de Atendimentos",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "specialty", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Lista de atendimentos no histórico" } },
      },
    },
    "/api/history/{id}": {
      get: {
        tags: ["Histórico & Auditoria"],
        summary: "Auditoria Completa de um Atendimento",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Detalhes e timeline do atendimento" } },
      },
    },
    "/api/history/export": {
      get: {
        tags: ["Histórico & Auditoria"],
        summary: "Exportar Histórico Completo em CSV",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Download do CSV de auditoria",
            content: { "text/csv": {} },
          },
        },
      },
    },
  },
};
