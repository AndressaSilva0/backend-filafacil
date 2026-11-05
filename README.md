# 🏥 FilaFácil UBS

**Sistema de Gerenciamento de Filas para Unidades Básicas de Saúde**

> Tornando o atendimento em UBS mais organizado, transparente e eficiente.

---

## 📋 Sobre o Projeto

Em muitas Unidades Básicas de Saúde (UBS), pacientes aguardam atendimento sem informações claras sobre a ordem da fila, o tempo estimado de espera ou o andamento dos atendimentos. O controle costuma ser realizado de forma manual, dificultando a organização da recepção, aumentando a percepção do tempo de espera e reduzindo a transparência do processo.

O **FilaFácil UBS** é um sistema que visa tornar o processo de atendimento mais organizado e transparente, permitindo que pacientes e recepcionistas acompanhem a fila em tempo real, reduzindo dúvidas e melhorando a experiência durante a espera.

### Pessoas Afetadas / Usuárias

- Pacientes que aguardam atendimento nas UBS
- Recepcionistas responsáveis pela organização da fila
- Profissionais de saúde que realizam os atendimentos
- Gestores da unidade

---

## ⚙️ Stack Tecnológica

| Camada                    | Tecnologia         |
| ------------------------- | ------------------ |
| **Front-end**             | React + Vite       |
| **Back-end**              | Node.js + Express  |
| **Banco de Dados**        | PostgreSQL         |
| **ORM**                   | Prisma             |
| **Tempo Real**            | Socket.IO          |
| **Versionamento**         | Git & GitHub       |
| **Gestão do Projeto**     | Trello             |

### Justificativa

A equipe possui conhecimento prévio em React, Node.js e Prisma, reduzindo a curva de aprendizado e permitindo maior produtividade. O React possibilita o desenvolvimento de uma interface intuitiva para recepcionistas e pacientes, enquanto o Node.js e o PostgreSQL oferecem uma base robusta para o gerenciamento das filas. O Socket.IO permitirá a atualização em tempo real da fila, e o Trello foi escolhido para organizar as atividades da equipe por meio de um fluxo simples e visual, atendendo aos requisitos da disciplina.

---

## 🚀 Funcionalidades (Escopo Inicial)

- ✅ Cadastro dos pacientes do dia
- ✅ Gerenciamento da fila de atendimento
- ✅ Chamada do próximo paciente
- ✅ Atualização do status do atendimento
- ✅ Visualização da fila em tempo real
- ✅ Registro básico dos atendimentos realizados

### Jornada Crítica

1. O recepcionista registra a chegada do paciente
2. O sistema adiciona o paciente à fila
3. Os profissionais chamam os pacientes conforme a ordem definida
4. A fila é atualizada em tempo real até a conclusão do atendimento

### Fora do Escopo

- Prontuário eletrônico
- Integração com o e-SUS APS
- Agendamento de consultas
- Emissão de receitas
- Controle de estoque de medicamentos
- Integração com sistemas governamentais
- Funcionalidades financeiras

---

## 👥 Equipe — Alpha Company

| Integrante                  | Responsabilidades na Sprint 1                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Hiago de Lima Zavarize**  | Organização do repositório, definição da stack, configuração inicial do projeto e apoio ao levantamento dos requisitos. |
| **Andressa Silva Pereira**  | Pesquisa com usuários, levantamento dos requisitos e documentação das evidências.                                      |
| **Leonardo Leal Moraes**    | Configuração do quadro no Trello, organização das tarefas da Sprint 1 e acompanhamento das atividades.                |
| **Sérgio Alves Coutinho**   | Pesquisa técnica, análise de viabilidade, revisão da documentação e apoio na elicitação dos requisitos.                |

---

## 📜 Acordo de Trabalho

- **Canal oficial:** Grupo no WhatsApp
- **Disponibilidade comum:** Segunda a sexta-feira, das 19h às 21h
- **Prazo de resposta:** Até 24 horas
- **Horário-limite da daily assíncrona (dias úteis sem aula):** 20h00
- **Registro de decisões:** Todas as decisões importantes serão registradas em um documento no repositório GitHub e referenciadas nos cartões do Trello quando necessário
- **Atualização do quadro:** O quadro do Trello será atualizado antes de cada aula e antes da publicação das dailies assíncronas
- **Tratamento de bloqueios:** O integrante deverá informar o bloqueio imediatamente no grupo oficial. Caso não seja resolvido pela equipe, será registrado no Trello e levado ao professor

---

## 🛠️ Ferramentas

| Finalidade              | Ferramenta   | Observação                                                                                                      |
| ------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------- |
| Gestão do projeto        | Trello       | Link a ser adicionado após a criação do quadro                                                                  |
| Repositório/documentação | GitHub       | [FilaFácil](https://github.com/AndressaSilva0/FilaFacil)                                                       |
| Comunicação              | WhatsApp     | Grupo da equipe                                                                                                 |
| Convite ao professor     | Trello       | A confirmar após convite para **fernando.chagas@ifma.edu.br** com permissão para visualizar e comentar o quadro |

---

## 🔍 Investigação e Evidências

### Indício Inicial

A equipe observou que diversas UBS ainda utilizam métodos manuais para organizar o atendimento. Além disso, são comuns relatos de usuários sobre demora, dificuldade para saber a ordem de atendimento e falta de informações durante a espera.

### Acesso à Evidência

A equipe pretende entrevistar pacientes, recepcionistas e profissionais de saúde de UBS da região, além de consultar documentos oficiais sobre o funcionamento da Atenção Primária e observar, quando possível, o fluxo de atendimento.

---

## 📊 Análise de Viabilidade

### Premissas

Pressupõe-se que um sistema simples para gerenciamento de filas pode melhorar a organização e a transparência do atendimento sem alterar os procedimentos clínicos já existentes.

### Restrições

- Tempo limitado ao semestre letivo
- Acesso restrito às UBS para observação do funcionamento
- Necessidade de validar as hipóteses com usuários reais
- Disponibilidade dos integrantes da equipe

### Riscos

- Dificuldade para entrevistar profissionais da saúde
- Necessidade de autorização para observar o atendimento
- Mudanças de escopo caso a investigação revele necessidades diferentes das hipóteses iniciais

### Maior Incerteza Técnica

Garantir que a atualização da fila ocorra em tempo real de forma estável quando houver várias alterações simultâneas.

### Primeiro Experimento Técnico

Desenvolver um protótipo simples utilizando Socket.IO para validar a atualização em tempo real entre duas telas (recepção e painel da fila).

---

## 🏃 Sprint 1

**Objetivo:** Validar a existência do problema com usuários reais, levantar os requisitos iniciais, definir a jornada crítica, configurar o ambiente de desenvolvimento, criar o quadro no Trello, organizar a documentação do projeto e validar a viabilidade técnica da atualização da fila em tempo real.

**Link do quadro:** *(a ser adicionado)*

**Principal bloqueio atual:** Obter acesso a profissionais e usuários de uma Unidade Básica de Saúde para validar as hipóteses levantadas pela equipe.

**Decisão necessária:** Confirmar se o problema identificado representa uma necessidade relevante para os usuários e definir quais funcionalidades farão parte do Produto Mínimo Viável (MVP).

---

## ✅ Confirmação da Equipe

Todos os integrantes revisaram e concordaram com o conteúdo deste documento.

---

## 📄 Licença

Este projeto foi desenvolvido como parte de uma disciplina acadêmica do IFMA.

---

## 💻 Como Rodar o Backend Localmente

### 1. Pré-requisitos
- Node.js 18+ (recomendado Node 20+)
- PostgreSQL local ou Supabase

### 2. Instalação
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 4. Executar Migrações e Seed do Banco
```bash
npx prisma db push
npm run prisma:seed
```

### 5. Iniciar em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor estará rodando em `http://localhost:3001` (com WebSocket no mesmo endereço).

### 6. Executar Testes Automatizados E2E
```bash
npm test
```

---

## 📡 Documentação Oficial da API REST & WebSockets

### 1. Autenticação e Gestão de Operadores (`/api/auth` e `/api/users`)
- `POST /api/auth/register`: Cadastro de operador com validação de CPF e termos SUS.
- `POST /api/auth/login`: Autenticação por CPF ou E-mail + Senha, geração de token JWT.
- `POST /api/auth/forgot-password`: Solicitação de recuperação de senha por e-mail/CPF.
- `POST /api/auth/reset-password`: Redefinição de senha utilizando token de segurança.
- `GET /api/users/profile`: Consulta perfil do operador logado (Bearer Token).
- `PUT /api/users/profile`: Atualização cadastral (telefone, cargo, unidade, matrícula funcional).
- `PUT /api/users/change-password`: Alteração de senha com validação da senha atual.
- `POST /api/users/avatar`: Upload de foto de perfil (multipart/form-data) ou seleção de preset.

### 2. Cadastro e Busca de Pacientes (`/api/patients`)
- `GET /api/patients/search?q=...`: Busca rápida unificada (Nome, CPF ou Cartão SUS) com simulação CADSUS.
- `GET /api/patients`: Listagem paginada de pacientes.
- `GET /api/patients/:id`: Detalhes cadastrais e histórico de atendimentos do paciente.
- `POST /api/patients`: Cadastro de paciente com prioridades legais e condições especiais.
- `PUT /api/patients/:id`: Atualização cadastral do cidadão.

### 3. Motor de Filas e Gestão de Senhas (`/api/tickets` ou `/api/queue`)
- `POST /api/tickets`: Emissão de senha com sequencial diário (URG-001, PRE-001, NOR-001) e comprovante térmico com QR Code.
- `GET /api/tickets`: Listagem da fila com filtros por status, especialidade, consultório, data e busca textual.
- `GET /api/tickets/waiting`: Fila legal do SUS ordenada por prioridade (Manchester > 80+ > 60+/Gestante/PCD > Convencional, FIFO).
- `POST /api/tickets/call-next`: Chama o próximo paciente da fila ordenado por prioridade.
- `POST /api/tickets/:id/call`: Chama uma senha específica vinculando sala e profissional.
- `POST /api/tickets/:id/recall`: Rechama a senha repetindo o alerta sonoro e visual na TV.
- `POST /api/tickets/:id/start`: Altera status para `EM_ATENDIMENTO` e inicia contagem de consulta.
- `POST /api/tickets/:id/finish`: Finaliza atendimento calculando tempo de espera e consulta, permite registrar CID-10 e anotações.
- `POST /api/tickets/:id/absent`: Marca o paciente como `AUSENTE` após tentativas sem resposta.
- `GET /api/tickets/export`: Exportação completa da fila diária em formato CSV (compatível com Excel).

### 4. Comunicação Real-time e Painel de TV (Socket.IO & `/api/tv`)
- **Eventos WebSocket Emitidos:**
  - `ticket:called`: Notifica nova senha chamada `{ code, patientName, room, doctor, priority, priorityLabel, specialty, timestamp }`.
  - `ticket:status-updated`: Sincroniza guichês quando um paciente é chamado, atendido, finalizado ou ausente.
  - `queue:metrics-updated`: Atualiza contadores em tempo real para o dashboard.
- **Endpoints REST para a TV:**
  - `GET /api/tv/current-call`: Retorna a chamada ativa atual para recuperação de estado em recargas.
  - `GET /api/tv/upcoming`: Lista as próximas senhas previstas com cálculo de tempo estimado.

### 5. Consultórios e Salas de Atendimento (`/api/rooms`)
- `GET /api/rooms`: Listagem de salas, especialidade padrão e profissionais alocados.
- `GET /api/rooms/:id`: Detalhes da sala.
- `POST /api/rooms`: Criação de sala ou consultório.
- `PUT /api/rooms/:id`: Atualização dos dados da sala.
- `POST /api/rooms/:id/assign`: Vincula o médico ou enfermeiro à sala de onde realizará as chamadas.

### 6. Estatísticas, Relatórios e Métricas (`/api/stats`)
- `GET /api/stats/dashboard`: Métricas em tempo real (total aguardando por prioridade, tempo médio de espera, atendidos hoje, ausências, cumprimento da meta de 20 min do SUS).
- `GET /api/stats/reports?period=today|week|month`: Relatórios analíticos por período (volume por especialidade, distribuição de pico das 07h às 17h, taxa de absenteísmo).
- `GET /api/stats/export?format=pdf|csv`: Exportação do relatório consolidado em PDF ou CSV.

### 7. Histórico e Auditoria Clínica (`/api/history`)
- `GET /api/history`: Consulta retroativa com filtros por data, período, status, especialidade, sala, profissional e busca textual.
- `GET /api/history/:id`: Detalhes completos do atendimento com auditoria clínica e linha do tempo de eventos.
- `GET /api/history/export`: Exportação do histórico clínico completo em CSV/Excel.

---

## ☁️ Deploy no Railway com Supabase

1. Crie um novo projeto no [Railway](https://railway.app/).
2. Escolha **"Deploy from GitHub repo"** e selecione o repositório `backend-filafacil`.
3. Em **Variables** do serviço no Railway, adicione:
   - `DATABASE_URL`: URL do Pooler do Supabase (com `?pgbouncer=true`)
   - `DIRECT_URL`: URL direta do Supabase
   - `CLIENT_ORIGIN`: URL do seu frontend React/Vite (ex: `https://seu-front.vercel.app` ou `*`)
4. O Railway executará automaticamente o script de build (`npm run build`) e iniciará o servidor (`npm run start`).
5. A rota de healthcheck está configurada em `/health`.

