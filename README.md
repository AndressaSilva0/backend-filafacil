# 🏥 FilaFácil UBS — Backend API & WebSockets

**Sistema Completo de Gerenciamento, Triagem e Chamada em Tempo Real para Unidades Básicas de Saúde (SUS)**

> Desenvolvido com Node.js, Express, TypeScript, Prisma ORM, Socket.IO e PostgreSQL no **Supabase**.

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Database](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Realtime](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Tests](https://img.shields.io/badge/Tests-37%20Passed%20(100%25)-brightgreen)](https://github.com/AndressaSilva0/FilaFacil)
[![License](https://img.shields.io/badge/License-IFMA%20Acadêmico-blue)](LICENSE)

---

## 📋 Sumário

1. [Visão Geral e Contexto](#-visão-geral-e-contexto)
2. [O que Foi Implementado](#-o-que-foi-implementado)
3. [Documentação Interativa Swagger UI (/docs)](#-documentação-interativa-swagger-ui-docs)
4. [Arquitetura e Stack Tecnológica](#-arquitetura-e-stack-tecnológica)
5. [Integração Oficial com o Supabase](#-integração-oficial-com-o-supabase)
6. [Como Rodar o Projeto na Máquina](#-como-rodar-o-projeto-na-máquina)
7. [Como Testar a Aplicação](#-como-testar-a-aplicação)
   - [Opção 1: Testes Automatizados E2E (npm test)](#opção-1-testes-automatizados-e2e-npm-test)
   - [Opção 2: Testes Manuais via cURL / Insomnia / Postman](#opção-2-testes-manuais-via-curl--insomnia--postman)
8. [Documentação de Rotas da API REST](#-documentação-de-rotas-da-api-rest)
9. [Eventos em Tempo Real (Socket.IO)](#-eventos-em-tempo-real-socketio)
10. [Como Fazer Deploy Gratuito (Render e Koyeb)](#-como-fazer-deploy-gratuito-render-e-koyeb)
11. [Estrutura de Pastas do Projeto](#-estrutura-de-pastas-do-projeto)
12. [Equipe e Autoria](#-equipe-e-autoria)

---

## 🏥 Visão Geral e Contexto

Em Unidades Básicas de Saúde (UBS) e serviços de Atenção Primária à Saúde (APS) do SUS, o controle manual de filas por papel ou planilhas costuma gerar desorganização, atrasos na triagem, insegurança nos pacientes quanto à ordem de atendimento e sobrecarga na recepção.

O **FilaFácil UBS** é um ecossistema integrado que resolve esse gargalo:
- **Recepção / Triagem**: Cadastra pacientes, simula consulta ao CADSUS, aplica critérios legais de prioridade e emite senhas sequenciais diárias com comprovante térmico e QR Code.
- **Consultórios e Salas Médicas**: Médicos e enfermeiros chamam o próximo paciente com 1 clique, iniciam o atendimento, registram observações/CID-10 e finalizam o ciclo.
- **Painel TV da Sala de Espera**: Exibição em tela cheia com contraste adaptativo, histórico das últimas chamadas, alerta sonoro harmônico e sintetizador vocal (Web Speech).
- **Gestão da UBS**: Dashboard com métricas em tempo real (tempo médio de espera, meta de 20 min do SUS, pico de horários e taxa de ausência).

---

## 🚀 O que Foi Implementado

O backend do FilaFácil UBS foi estruturado em **7 módulos operacionais completos**:

| Módulo | Escopo & Funcionalidades | Status |
| :--- | :--- | :---: |
| **1. Autenticação & Operadores** | Registro com validação de CPF e termos SUS, login JWT, recuperação e redefinição de senha com token criptográfico, atualização de perfil cadastral, troca de senha e upload de avatar/crachá. | ✅ 100% |
| **2. Cadastro & Simulação CADSUS** | Busca unificada inteligente (Nome, CPF ou Cartão Nacional de Saúde - CNS), cadastro de pacientes com condições especiais (hipertensão, diabetes, gestação, etc.), listagem paginada e edição cadastral. | ✅ 100% |
| **3. Motor de Filas & Prioridades** | Emissão de senhas diárias (`URG-001`, `PRE-001`, `NOR-001`), fila SUS estrita por prioridades legais (Manchester > Idoso 80+ > Idoso 60+/Gestante/PCD > Convencional, FIFO), ciclo de vida (`WAITING` ➔ `CALLED` ➔ `IN_PROGRESS` ➔ `FINISHED` ou `ABSENT`), rechamada e exportação CSV. | ✅ 100% |
| **4. Consultórios & Salas** | Cadastro e gerenciamento de salas/consultórios, especialidade padrão e alocação dinâmica de profissionais a cada sala. | ✅ 100% |
| **5. Painel TV & WebSockets** | Endpoints dedicados para recuperação de chamada ativa (`/api/tv/current-call`) e próximas senhas previstas (`/api/tv/upcoming`), com sincronização via Socket.IO para múltiplos guichês e telas. | ✅ 100% |
| **6. Métricas & Relatórios** | Cálculo em tempo real de pacientes aguardando, tempo médio de espera, taxa de absenteísmo, adesão à meta SUS (20 min), gráficos por período e exportação em PDF e CSV. | ✅ 100% |
| **7. Histórico & Auditoria** | Linha do tempo auditável de cada atendimento (hora de emissão, chamada, início e término, sala e operador responsável), filtros avançados e exportação para auditoria ambulatorial. | ✅ 100% |

---

## 📖 Documentação Interativa Swagger UI (`/docs`)

A API conta com interface interativa **Swagger UI** completa e especificação **OpenAPI 3.0** com botão *"Try it out"* para testar todos os endpoints direto pelo navegador:

- **Produção (Render):** [https://backend-filafacil.onrender.com/docs](https://backend-filafacil.onrender.com/docs)
- **Local:** [http://localhost:3001/docs](http://localhost:3001/docs) (ou `/api-docs`)
- **JSON OpenAPI (para Insomnia/Postman):** [https://backend-filafacil.onrender.com/docs.json](https://backend-filafacil.onrender.com/docs.json)

---

## ⚙️ Arquitetura e Stack Tecnológica

- **Linguagem & Runtime:** [Node.js](https://nodejs.org/) (v18+) com [TypeScript](https://www.typescriptlang.org/) (tipagem estrita em 100% do código).
- **Framework Web:** [Express.js](https://expressjs.com/) com middlewares de segurança (`helmet`, `cors`, `rate-limit`).
- **Banco de Dados Relacional:** [PostgreSQL](https://www.postgresql.org/) hospedado no [Supabase](https://supabase.com/).
- **ORM:** [Prisma ORM](https://www.prisma.io/) com migrations, seeders e tipagem automática dos modelos.
- **Comunicação Realtime:** [Socket.IO](https://socket.io/) (comunicação bidirecional com baixa latência).
- **Autenticação & Criptografia:** [JSON Web Token (JWT)](https://jwt.io/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) para hashing de senhas.
- **SDK Oficial Supabase:** `@supabase/server` e `@supabase/supabase-js`.
- **Geração de Documentos:** [PDFKit](https://pdfkit.org/) (relatórios clínicos e estatísticos em PDF) e [qrcode-svg](https://github.com/papnkukn/qrcode-svg) (QR Codes dos tickets).
- **Conteinerização:** [Docker](https://www.docker.com/) multi-stage pronto para produção.

---

## 🗄️ Integração Oficial com o Supabase

O projeto está configurado e conectado diretamente ao banco de dados PostgreSQL do **Supabase**.

### Estrutura das Tabelas Criadas:
- `users`: Operadores da UBS (médicos, recepcionistas, gestores), credenciais e dados funcionais.
- `rooms`: Salas e consultórios médicos da unidade.
- `patients`: Cadastro ambulatorial com CPF, Cartão Nacional de Saúde (CNS) e dados de contato.
- `tickets`: Senhas emitidas, prioridade, status de atendimento, tempos de espera e consulta, sala e operador.

### Configuração no `.env`:
```env
# Conexão com o Banco Supabase (Pooler na porta 5432 / 6543)
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.hbpqgedsxbthvmmyjeol.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:SUA_SENHA@db.hbpqgedsxbthvmmyjeol.supabase.co:5432/postgres?sslmode=require"

# Chaves de API do Supabase
SUPABASE_URL="https://hbpqgedsxbthvmmyjeol.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."
SUPABASE_JWKS_URL="https://hbpqgedsxbthvmmyjeol.supabase.co/auth/v1/.well-known/jwks.json"
```

> 💡 **Nota sobre Caracteres Especiais na Senha:** Se a sua senha do Supabase contiver caracteres especiais como `#`, codifique-a no padrão URL (exemplo: `#` vira `%23`).

---

## 💻 Como Rodar o Projeto na Máquina

### 1. Pré-requisitos
- **Node.js** (versão 18.x ou 20.x recomendada)
- **Git**
- **npm** (ou yarn/pnpm)

### 2. Clonar o Repositório e Entrar na Pasta
```bash
git clone https://github.com/AndressaSilva0/FilaFacil.git
cd FilaFacil/filafacil-backend
```

### 3. Instalar as Dependências
```bash
npm install
```

### 4. Configurar as Variáveis de Ambiente
Copie o arquivo de exemplo `.env.example` para `.env`:
```bash
cp .env.example .env
```
Abra o `.env` e confirme suas configurações preenchendo as credenciais do seu Supabase:
```env
PORT=3001
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:3000
DATABASE_URL="postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:5432/postgres?sslmode=require"
JWT_SECRET="filafacil-super-secret-key-sus-ubs-2026"
JWT_EXPIRES_IN="1d"
JWT_REMEMBER_EXPIRES_IN="30d"
SUPABASE_URL="https://[SEU_PROJETO].supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."
SUPABASE_JWKS_URL="https://[SEU_PROJETO].supabase.co/auth/v1/.well-known/jwks.json"
```

### 5. Sincronizar o Banco e Popular Dados Iniciais (Seed)
Execute a sincronização do schema Prisma com o banco de dados do Supabase e popule com dados de teste realistas:
```bash
# Sincroniza as tabelas com o banco
npx prisma db push

# Popula o banco com operadores, consultórios, pacientes CADSUS e senhas
npm run prisma:seed
```

### 6. Iniciar o Servidor Backend
```bash
npm run dev
```
O servidor iniciará em:
- **API REST**: `http://localhost:3001`
- **Healthcheck**: `http://localhost:3001/health`
- **WebSocket (Socket.IO)**: `ws://localhost:3001`

---

### 🎨 (Opcional) Como Rodar o Frontend Integrado
Em outro terminal, acesse a pasta do frontend e inicie a interface gráfica:
```bash
cd ../filafacil-frontend
npm install
npm run dev
```
O frontend estará acessível em `http://localhost:5174` (ou `5173`) e se comunicará automaticamente com o backend na porta 3001.

---

## 🧪 Como Testar a Aplicação

### Opção 1: Testes Automatizados E2E (`npm test`)

O projeto possui uma suíte completa de **37 testes automatizados de ponta a ponta** (`test/e2e-test.ts`) que valida todas as rotas e regras de negócio diretamente contra o banco de dados.

Para rodar os testes:
```bash
npm test
```

**Resultado esperado:**
```text
==================================================
  FILAFACIL UBS - BATERIA DE TESTES E2E
==================================================
[1/7] TESTES DE AUTENTICACAO E USUARIOS
  ✓ 1.1 POST /api/auth/register - Cadastro de novo operador
  ✓ 1.2 POST /api/auth/login - Login com email e senha
  ✓ 1.3 POST /api/auth/login - Login com CPF e senha
  ✓ 1.4 GET  /api/users/profile - Consulta perfil com Bearer Token
  ✓ 1.5 PUT  /api/users/profile - Atualizacao cadastral
  ✓ 1.6 POST /api/auth/forgot-password - Solicitacao de recuperacao
...
==================================================
RESULTADO DOS TESTES:
  Total de testes: 37
  Sucessos: 37
  Falhas: 0
  Taxa de sucesso: 100.0%
==================================================
```

---

### Opção 2: Testes Manuais via cURL / Insomnia / Postman

Você pode testar qualquer endpoint diretamente pelo terminal via `curl` ou importar no **Insomnia** / **Postman**.

#### 1. Verificar se a API está no ar (Health Check)
```bash
curl -X GET http://localhost:3001/health
```
**Resposta (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-11-05T18:00:00.000Z",
  "database": "connected"
}
```

---

#### 2. Fazer Login e Obter o Token JWT
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "andressa.silva@ubs.saude.gov.br",
    "password": "SenhaForte123!"
  }'
```
> 📌 **Dica:** Copie o campo `"token"` retornado para usar nos próximos comandos como `Bearer <SEU_TOKEN>`.

---

#### 3. Consultar Perfil do Operador Logado
```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer <SEU_TOKEN>"
```

---

#### 4. Buscar Paciente na Simulação CADSUS
Busca unificada por nome, CPF ou número do Cartão SUS:
```bash
curl -X GET "http://localhost:3001/api/patients/search?q=Benedita" \
  -H "Authorization: Bearer <SEU_TOKEN>"
```

---

#### 5. Emitir Nova Senha na Fila (Triagem)
Cria um atendimento com prioridade legal (ex: `PREFERENCIAL_80` para idosos 80+):
```bash
curl -X POST http://localhost:3001/api/tickets \
  -H "Authorization: Bearer <SEU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Maria Helena Cavalcanti",
    "cpf": "489.201.782-90",
    "cartaoSus": "702409188320019",
    "priority": "PREFERENCIAL_80",
    "specialty": "Clinica Geral"
  }'
```
**Resposta:** Retorna o ticket criado com código sequencial (ex: `PRE-006`), QR Code SVG embutido e comprovante térmico.

---

#### 6. Consultar a Fila de Espera Ordenada por Prioridade SUS
Retorna as senhas que estão aguardando chamada ordenadas estritamente pela legislação:
```bash
curl -X GET http://localhost:3001/api/tickets/waiting \
  -H "Authorization: Bearer <SEU_TOKEN>"
```

---

#### 7. Chamar o Próximo Paciente da Fila
Chama automaticamente o próximo paciente de maior prioridade para a sala indicada:
```bash
curl -X POST http://localhost:3001/api/tickets/call-next \
  -H "Authorization: Bearer <SEU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "Consultorio 01",
    "doctorName": "Dra. Juliana Mendes"
  }'
```
*(Ao rodar este comando, um evento WebSocket `ticket:called` é disparado imediatamente para atualizar o Painel da TV).*

---

#### 8. Iniciar o Atendimento do Paciente
Substitua `<TICKET_ID>` pelo ID retornado na chamada anterior:
```bash
curl -X POST http://localhost:3001/api/tickets/<TICKET_ID>/start \
  -H "Authorization: Bearer <SEU_TOKEN>"
```

---

#### 9. Finalizar o Atendimento com Diagnóstico e Anotações
```bash
curl -X POST http://localhost:3001/api/tickets/<TICKET_ID>/finish \
  -H "Authorization: Bearer <SEU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Paciente atendido, prescrita medicacao de uso continuo e encaminhado para retorno em 30 dias.",
    "cid10": "I10"
  }'
```

---

#### 10. Consultar a Chamada Ativa no Painel da TV (Sem Auth)
Usado pelo painel da TV da sala de espera para exibir a senha atual:
```bash
curl -X GET http://localhost:3001/api/tv/current-call
```

---

#### 11. Consultar Métricas do Dashboard em Tempo Real
```bash
curl -X GET http://localhost:3001/api/stats/dashboard \
  -H "Authorization: Bearer <SEU_TOKEN>"
```
Retorna contadores de aguardando, chamados, atendidos hoje, ausências, tempo médio de espera e % dentro da meta do SUS.

---

#### 12. Exportar a Fila Diária em CSV
```bash
curl -X GET http://localhost:3001/api/tickets/export \
  -H "Authorization: Bearer <SEU_TOKEN>" \
  -o fila_hoje.csv
```

---

## 📡 Documentação de Rotas da API REST

### Autenticação & Operadores
| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Cadastro de novo operador | Não |
| `POST` | `/api/auth/login` | Login por e-mail/CPF + senha (retorna JWT) | Não |
| `POST` | `/api/auth/forgot-password` | Solicita recuperação de senha por e-mail | Não |
| `POST` | `/api/auth/reset-password` | Redefine senha com token de recuperação | Não |
| `GET` | `/api/users/profile` | Consulta perfil do operador logado | Sim |
| `PUT` | `/api/users/profile` | Atualiza dados cadastrais e funcionais | Sim |
| `PUT` | `/api/users/change-password` | Altera a senha do operador | Sim |
| `POST` | `/api/users/avatar` | Upload de avatar ou seleção de preset | Sim |

### Pacientes & CADSUS
| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/patients/search?q=...` | Busca rápida no CADSUS por nome, CPF ou CNS | Sim |
| `GET` | `/api/patients` | Listagem paginada de pacientes | Sim |
| `GET` | `/api/patients/:id` | Detalhes e histórico do paciente | Sim |
| `POST` | `/api/patients` | Cadastro de paciente com prioridades legais | Sim |
| `PUT` | `/api/patients/:id` | Edição cadastral do paciente | Sim |

### Motor de Filas & Senhas
| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/tickets` | Emite nova senha com QR Code e comprovante | Sim |
| `GET` | `/api/tickets` | Listagem da fila com filtros combinados | Sim |
| `GET` | `/api/tickets/waiting` | Fila ordenada por prioridade legal do SUS | Sim |
| `POST` | `/api/tickets/call-next` | Chama próximo paciente por prioridade | Sim |
| `POST` | `/api/tickets/:id/call` | Chama uma senha específica vinculando sala | Sim |
| `POST` | `/api/tickets/:id/recall` | Rechama a senha (dispara novo alerta sonoro/TV) | Sim |
| `POST` | `/api/tickets/:id/start` | Altera status para `IN_PROGRESS` | Sim |
| `POST` | `/api/tickets/:id/finish` | Finaliza atendimento com anotações e CID-10 | Sim |
| `POST` | `/api/tickets/:id/absent` | Marca paciente como `ABSENT` (ausente) | Sim |
| `GET` | `/api/tickets/export` | Exporta fila do dia em formato CSV | Sim |

### Consultórios & Salas
| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/rooms` | Lista salas e profissionais vinculados | Sim |
| `GET` | `/api/rooms/:id` | Detalhes da sala | Sim |
| `POST` | `/api/rooms` | Cria nova sala/consultório | Sim |
| `PUT` | `/api/rooms/:id` | Atualiza dados da sala | Sim |
| `POST` | `/api/rooms/:id/assign` | Aloca profissional à sala de atendimento | Sim |

### Painel TV & Recepção
| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/tv/current-call` | Consulta chamada ativa atual para a TV | Não |
| `GET` | `/api/tv/upcoming` | Consulta próximas senhas previstas da fila | Não |

### Estatísticas & Relatórios
| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/stats/dashboard` | Métricas em tempo real e meta de 20 min do SUS | Sim |
| `GET` | `/api/stats/reports` | Relatórios analíticos por período (dia, semana, mês) | Sim |
| `GET` | `/api/stats/export?format=pdf` | Exporta relatório consolidado em PDF | Sim |
| `GET` | `/api/stats/export?format=csv` | Exporta relatório consolidado em CSV | Sim |

### Histórico & Auditoria
| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/history` | Consulta histórico retroativo com filtros | Sim |
| `GET` | `/api/history/:id` | Detalhes completos do atendimento e timeline | Sim |
| `GET` | `/api/history/export` | Exportação de histórico para auditoria | Sim |

---

## 🔔 Eventos em Tempo Real (Socket.IO)

O backend emite e consome os seguintes eventos para manter todos os clientes sincronizados:

- **`ticket:called`**: Emitido quando uma senha é chamada ou rechamada.
  ```json
  {
    "id": "c1f7b8...",
    "code": "PRE-001",
    "patientName": "Benedita Souza Costa",
    "room": "Consultorio 01",
    "doctor": "Dra. Juliana Mendes",
    "priority": "PREFERENCIAL_80",
    "timestamp": "2026-11-05T18:00:00.000Z"
  }
  ```
- **`ticket:status-updated`**: Emitido quando o status de uma senha muda (`CALLED`, `IN_PROGRESS`, `FINISHED`, `ABSENT`).
- **`queue:metrics-updated`**: Disparado para atualizar contadores no dashboard em tempo real.

---

## ☁️ Como Fazer Deploy Gratuito (Render e Koyeb)

Como o Railway removeu o plano gratuito, o projeto já inclui **configurações oficiais e gratuitas** para deploy no **Render** (via blueprint `render.yaml`) e no **Koyeb** (via `Dockerfile` multi-stage).

Ambos os serviços oferecem:
- **Plano gratuito perpétuo** sem necessidade de cartão de crédito.
- Suporte nativo a **WebSockets** (Socket.IO) e conexões persistentes.
- **HTTPS e WSS automáticos** com certificado SSL gratuito.

---

### Opção 1: Deploy Gratuito no Render (Recomendado)

O repositório já contém o arquivo [`render.yaml`](render.yaml) configurado para subir no plano gratuito (`plan: free`).

1. Crie uma conta gratuita em [render.com](https://render.com/).
2. No painel do Render, clique em **"New +"** ➔ **"Blueprint"**.
3. Conecte sua conta do GitHub e selecione o repositório `FilaFacil`.
4. O Render detectará automaticamente o arquivo `render.yaml`.
5. Preencha apenas os valores das variáveis secretas solicitadas:
   - `DATABASE_URL`: URL do Pooler do Supabase (com `sslmode=require`).
   - `DIRECT_URL`: URL direta do Supabase.
   - `CLIENT_ORIGIN`: URL onde seu frontend estará hospedado (ex: `https://filafacil-frontend.vercel.app` ou `*` para testes).
6. Clique em **"Apply"**. O Render fará o build, executará as migrações do Prisma e colocará o serviço no ar com healthcheck em `/health`.

---

### Opção 2: Deploy Gratuito no Koyeb (com Dockerfile)

O repositório já conta com um [`Dockerfile`](Dockerfile) multi-stage otimizado com cache de dependências e Prisma Client pré-gerado.

1. Crie uma conta gratuita em [koyeb.com](https://www.koyeb.com/).
2. Clique em **"Create App"** ➔ **"GitHub"**.
3. Selecione o repositório `FilaFacil`.
4. Em **Builder**, selecione **Dockerfile** (o Koyeb detectará automaticamente o `Dockerfile` na raiz do backend).
5. Em **Instance**, selecione a categoria **Free / Eco (Micro)**.
6. Em **Environment Variables**, adicione:
   - `PORT`: `3001`
   - `DATABASE_URL`: URL de conexão do Supabase
   - `DIRECT_URL`: URL direta do Supabase
   - `JWT_SECRET`: Uma chave secreta segura
   - `SUPABASE_URL`: `https://hbpqgedsxbthvmmyjeol.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY`: sua chave pública do Supabase
   - `SUPABASE_SECRET_KEY`: sua chave secreta do Supabase
7. Em **Health Checks**, configure rota `/health` na porta `3001`.
8. Clique em **"Deploy"**.

---

## 📁 Estrutura de Pastas do Projeto

```text
filafacil-backend/
├── Dockerfile                  # Multi-stage build otimizado para deploy em Docker/Koyeb
├── render.yaml                 # Configuração Blueprint para deploy gratuito no Render
├── package.json                # Dependências e scripts npm
├── tsconfig.json               # Configurações do TypeScript
├── prisma/
│   ├── schema.prisma           # Modelos de dados (User, Room, Patient, Ticket)
│   └── seed.ts                 # Script de população de dados iniciais do SUS
├── src/
│   ├── server.ts               # Ponto de entrada, configuração do Express e Socket.IO
│   ├── config/
│   │   ├── env.ts              # Validação e tipagem de variáveis de ambiente
│   │   ├── prisma.ts           # Instância singleton do Prisma Client
│   │   └── supabase.ts         # Inicialização do SDK Supabase (@supabase/server)
│   ├── controllers/            # Controladores das requisições HTTP
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── ticket.controller.ts
│   │   ├── room.controller.ts
│   │   ├── tv.controller.ts
│   │   ├── stats.controller.ts
│   │   └── history.controller.ts
│   ├── services/               # Regras de negócio e lógica de aplicação
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── patient.service.ts
│   │   ├── queue.service.ts
│   │   ├── room.service.ts
│   │   ├── tv.service.ts
│   │   ├── stats.service.ts
│   │   └── history.service.ts
│   ├── routes/                 # Definição e agrupamento de rotas
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── ticket.routes.ts
│   │   ├── room.routes.ts
│   │   ├── tv.routes.ts
│   │   ├── stats.routes.ts
│   │   └── history.routes.ts
│   ├── middlewares/            # Middlewares de autenticação JWT, validação e erros
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   └── utils/                  # Utilitários (PDF, QRCode, máscaras SUS, etc.)
│       ├── pdf.util.ts
│       └── qrcode.util.ts
└── test/
    └── e2e-test.ts             # Bateria automatizada de 37 testes de integração E2E
```

---

## 👥 Equipe e Autoria — Alpha Company (IFMA)

Projeto desenvolvido como parte da formação acadêmica em Ciência da Computação / Engenharia de Software no **IFMA (Instituto Federal do Maranhão)**.

| Integrante | Função e Contribuições |
| :--- | :--- |
| **Andressa Silva Pereira** | Engenharia de Software, Backend APIs, Integração Supabase, Testes E2E e UX/UI |
| **Hiago de Lima Zavarize** | Arquitetura de Software, Modelagem de Dados, DevOps e Estruturação de Repositório |
| **Leonardo Leal Moraes** | Gestão de Qualidade, Planejamento de Sprints e Acompanhamento de Atividades |
| **Sérgio Alves Coutinho** | Pesquisa Técnica, Levantamento de Requisitos e Validação de Fluxos do SUS |

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de impacto social no atendimento à saúde pública. Distribuído sob as diretrizes acadêmicas do IFMA.
