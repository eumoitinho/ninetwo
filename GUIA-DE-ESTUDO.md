# 📚 Guia de Estudo Sistemático - Projeto Ninetwo

## 🎯 Visão Geral

O **Ninetwo** é um sistema CRM (Customer Relationship Management) completo construído com arquitetura moderna de monorepo usando Nx. É baseado no Twenty CRM, mas com extensões personalizadas, especialmente para marketing e automação.

**Versão:** 0.2.1
**Licença:** AGPL-3.0
**Node Version:** 24.5.0
**Package Manager:** Yarn 4.9.2

---

## 📋 Índice do Estudo

### Fase 1: Fundamentos (1-2 semanas)
- [x] 1.1 - Arquitetura Geral do Projeto
- [ ] 1.2 - Estrutura do Monorepo (Nx)
- [ ] 1.3 - Stack Tecnológico
- [ ] 1.4 - Setup do Ambiente de Desenvolvimento

### Fase 2: Backend (2-3 semanas)
- [ ] 2.1 - Estrutura do NestJS
- [ ] 2.2 - Sistema de Módulos
- [ ] 2.3 - Database & TypeORM
- [ ] 2.4 - GraphQL API
- [ ] 2.5 - Autenticação & Autorização

### Fase 3: Frontend (2-3 semanas)
- [ ] 3.1 - Estrutura React
- [ ] 3.2 - Gerenciamento de Estado (Recoil)
- [ ] 3.3 - Sistema de Rotas
- [ ] 3.4 - Componentes UI (ninetwo-ui)
- [ ] 3.5 - Apollo Client & GraphQL

### Fase 4: Módulos de Negócio (3-4 semanas)
- [ ] 4.1 - Sistema de Marketing
- [ ] 4.2 - Sistema de Mensagens
- [ ] 4.3 - Sistema de Calendário
- [ ] 4.4 - Sistema de Workflow
- [ ] 4.5 - CRM Core (Contatos, Empresas, Oportunidades)

### Fase 5: Integrações & Avançado (2-3 semanas)
- [ ] 5.1 - Integrações Externas (Google, Meta, etc)
- [ ] 5.2 - Sistema de Webhooks
- [ ] 5.3 - AI/LLM Integration
- [ ] 5.4 - Sistema de Notificações
- [ ] 5.5 - Background Jobs (BullMQ)

### Fase 6: DevOps & Deploy (1-2 semanas)
- [ ] 6.1 - Docker & Kubernetes
- [ ] 6.2 - CI/CD Pipeline
- [ ] 6.3 - Monitoramento & Logs
- [ ] 6.4 - Testes (Unit, Integration, E2E)

---

## 🏗️ Arquitetura do Sistema

### Estrutura do Monorepo

```
ninetwo/
├── packages/
│   ├── ninetwo-front/         # Frontend React + Vite
│   ├── ninetwo-server/        # Backend NestJS + GraphQL
│   ├── ninetwo-shared/        # Código compartilhado (tipos, utils)
│   ├── ninetwo-ui/           # Biblioteca de componentes UI
│   ├── ninetwo-emails/       # Templates de emails
│   ├── ninetwo-cli/          # Interface de linha de comando
│   ├── ninetwo-sdk/          # SDK para integrações
│   ├── ninetwo-zapier/       # Integração com Zapier
│   ├── ninetwo-e2e-testing/ # Testes End-to-End (Playwright)
│   ├── ninetwo-docker/       # Configurações Docker/K8s
│   └── ninetwo-marketing-*/  # Módulos de marketing
└── tools/
    └── eslint-rules/         # Regras ESLint customizadas
```

### Stack Tecnológico

#### Backend
- **Framework:** NestJS 9.4.3
- **Linguagem:** TypeScript 5.9.2
- **API:** GraphQL (GraphQL Yoga)
- **Database:** PostgreSQL + TypeORM
- **Cache/Queue:** Redis + BullMQ
- **Auth:** Passport JWT, OAuth2 (Google, Microsoft)
- **AI/LLM:** OpenAI, Anthropic, xAI
- **Integrations:** Google Ads/Analytics, Facebook Business SDK

#### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 7.0.0
- **State Management:** Recoil 0.7.7
- **GraphQL Client:** Apollo Client 3.7.17
- **Styling:** Styled Components + Emotion
- **Router:** React Router DOM 6.4.4
- **Rich Text:** TipTap, BlockNote
- **Charts:** Nivo, ECharts
- **UI Components:** Custom library (@ninetwo-ui)

#### DevOps
- **Monorepo Tool:** Nx 21.3.11
- **Package Manager:** Yarn 4.9.2
- **Testing:** Jest, Playwright, Storybook
- **Linting:** ESLint 9.32.0, Prettier
- **CI/CD:** Nx Cloud
- **Containerization:** Docker, Kubernetes
- **Monitoring:** OpenTelemetry, Grafana

---

## 🎓 Como Estudar Este Projeto

### 1️⃣ Abordagem Top-Down (Recomendada para Iniciantes)

Comece entendendo o todo, depois mergulhe nos detalhes:

1. **Visão Geral** → Leia este guia completamente
2. **Arquitetura** → Estude os diagramas de arquitetura
3. **Fluxos Principais** → Entenda os fluxos de dados
4. **Módulos Individuais** → Mergulhe em cada módulo
5. **Código Fonte** → Analise implementações específicas

### 2️⃣ Abordagem Bottom-Up (Para Desenvolvedores Experientes)

Comece com código e construa o entendimento:

1. **Setup Local** → Configure o ambiente
2. **Debug & Explore** → Use breakpoints e logs
3. **Fluxo de Request** → Trace uma requisição completa
4. **Entidades & Models** → Entenda o modelo de dados
5. **Arquitetura Geral** → Abstraia os padrões

### 3️⃣ Abordagem Feature-Based (Prática)

Aprenda implementando features:

1. **Escolha uma Feature** → Ex: CRUD de Contatos
2. **Frontend → Backend** → Trace o fluxo completo
3. **Crie uma Feature Nova** → Implemente algo simples
4. **Refatore** → Melhore o código existente
5. **Documente** → Explique o que aprendeu

---

## 📊 Diagrama de Arquitetura Simplificado

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE / USUÁRIO                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    NINETWO-FRONT (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │ Modules  │  │   UI     │  │  Apollo  │   │
│  │  Routing │  │  Recoil  │  │Components│  │  Client  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ GraphQL Queries/Mutations
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  NINETWO-SERVER (NestJS)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              GraphQL API Layer                       │  │
│  │  (Resolvers, Query Hooks, Middlewares)              │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────┴────────────────────────────────┐  │
│  │           Business Logic Modules                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │Marketing │ │Messaging │ │Calendar  │ │Workflow│ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │Companies │ │ Contacts │ │   Tasks  │ │  Auth  │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │                                     │
│  ┌─────────────────────┴────────────────────────────────┐  │
│  │          Infrastructure Layer                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │ TypeORM  │ │  Redis   │ │  BullMQ  │ │  Auth  │ │  │
│  │  │ Database │ │  Cache   │ │  Queue   │ │Service │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │  │
│  └─────────────────────┬────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │PostgreSQL│  │  Redis   │  │  S3/     │  │   AI     │   │
│  │ Database │  │  Store   │  │ Storage  │  │  APIs    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Google   │  │   Meta   │  │  Email   │                 │
│  │  APIs    │  │   APIs   │  │ Services │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxos Principais do Sistema

### Fluxo 1: Autenticação de Usuário

```
1. User → Frontend (Login Form)
2. Frontend → GraphQL Mutation (login)
3. Server → Auth Service → Passport JWT
4. Database → Verify Credentials
5. Server → Generate JWT Token
6. Frontend → Store Token → Apollo Client Header
7. Frontend → Redirect to Dashboard
```

### Fluxo 2: CRUD de Entidades (Ex: Company)

```
1. Frontend → Query/Mutation via Apollo Client
2. GraphQL Resolver → Company Module
3. TypeORM Repository → PostgreSQL
4. Server → Apply Business Logic & Hooks
5. Server → Return GraphQL Response
6. Frontend → Update Recoil State
7. UI → Re-render with New Data
```

### Fluxo 3: Background Job (Ex: Import Emails)

```
1. User Trigger → Frontend Action
2. Server → Create Job → BullMQ Queue
3. Worker → Pick Job from Queue
4. Worker → Fetch External Data (Gmail API)
5. Worker → Process & Transform Data
6. Worker → Save to Database (TypeORM)
7. Worker → Update Status & Notify
```

### Fluxo 4: Integração Externa (Ex: Google Ads)

```
1. User → Configure OAuth in Settings
2. Frontend → Redirect to Google OAuth
3. Google → Return Authorization Code
4. Server → Exchange Code for Tokens
5. Server → Store Tokens (Connected Account)
6. Cron Job → Trigger Data Sync
7. Service → Fetch Ads Data → Google Ads API
8. Service → Transform & Store Data
9. Frontend → Display in Dashboard
```

---

## 📁 Estrutura Detalhada de Pastas

### Backend (ninetwo-server/src/)

```
src/
├── engine/                        # Core do sistema
│   ├── api/                       # API & GraphQL setup
│   ├── core-modules/              # Módulos fundamentais
│   │   ├── auth/                  # Autenticação
│   │   ├── ninetwo-config/       # Configurações
│   │   ├── logger/                # Sistema de logs
│   │   └── session-storage/       # Sessões
│   ├── workspace-manager/         # Gestão de workspaces
│   └── metadata/                  # Sistema de metadados
├── modules/                       # Módulos de negócio
│   ├── marketing/                 # Sistema de marketing
│   ├── messaging/                 # Sistema de mensagens
│   ├── calendar/                  # Sistema de calendário
│   ├── workflow/                  # Automação & workflows
│   ├── connected-account/         # Contas conectadas (OAuth)
│   ├── company/                   # Empresas
│   ├── person/                    # Contatos/Pessoas
│   ├── opportunity/               # Oportunidades de venda
│   └── task/                      # Tarefas
├── database/                      # Configurações de banco
│   ├── typeorm/                   # TypeORM setup
│   └── clickhouse/                # ClickHouse (analytics)
├── filters/                       # Exception filters
├── utils/                         # Utilitários
└── main.ts                        # Entry point
```

### Frontend (ninetwo-front/src/)

```
src/
├── modules/                       # Módulos funcionais
│   ├── app/                       # App setup & routing
│   ├── auth/                      # Autenticação
│   ├── ui/                        # Componentes UI base
│   ├── object-record/             # Sistema de records genérico
│   ├── object-metadata/           # Metadados de objetos
│   ├── settings/                  # Configurações
│   ├── marketing/                 # Marketing UI
│   ├── activities/                # Atividades/Timeline
│   ├── workflow/                  # Workflow UI
│   ├── command-menu/              # Command palette (Cmd+K)
│   ├── favorites/                 # Favoritos
│   ├── views/                     # Sistema de views
│   └── apollo/                    # Apollo Client setup
├── pages/                         # Páginas/Routes
│   ├── settings/                  # Páginas de configuração
│   ├── marketing/                 # Páginas de marketing
│   └── object-record/             # Páginas de records
├── generated/                     # Código gerado (GraphQL)
└── App.tsx                        # Componente raiz
```

---

## 🎯 Pontos de Entrada Importantes

### Backend Entry Points

1. **`main.ts`** - Bootstrap da aplicação NestJS
2. **`app.module.ts`** - Módulo raiz
3. **`modules/modules.module.ts`** - Agregador de módulos de negócio
4. **`engine/api/graphql/`** - Setup do GraphQL

### Frontend Entry Points

1. **`src/index.tsx`** - Entry point React
2. **`src/App.tsx`** - Componente raiz
3. **`src/modules/app/hooks/useCreateAppRouter.tsx`** - Definição de rotas
4. **`src/modules/apollo/ApolloClientProvider.tsx`** - Setup Apollo

---

## 🔧 Comandos Úteis para Estudo

### Setup Inicial

```bash
# Clonar e instalar
git clone <repo-url>
cd ninetwo
yarn install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar PostgreSQL e Redis (Docker)
cd packages/ninetwo-docker
docker-compose up -d postgres redis
```

### Development

```bash
# Iniciar tudo (frontend + backend + worker)
yarn start

# Apenas backend
npx nx start ninetwo-server

# Apenas frontend
npx nx start ninetwo-front

# Worker (background jobs)
npx nx worker ninetwo-server
```

### Debug & Exploration

```bash
# Ver dependências do projeto
npx nx graph

# Testar backend
npx nx test ninetwo-server

# Testar frontend
npx nx test ninetwo-front

# Lint & Type check
npx nx lint ninetwo-server
npx nx typecheck ninetwo-server

# Ver logs em tempo real
npx nx start ninetwo-server --verbose
```

### Database

```bash
# Inicializar banco
npx nx database:init:prod ninetwo-server

# Criar migration
npx nx typeorm migration:generate src/database/typeorm/core/migrations/MyMigration -d src/database/typeorm/core/core.datasource.ts

# Rodar migrations
npx nx database:migrate:prod ninetwo-server

# Reset do banco (cuidado!)
npx nx database:reset ninetwo-server
```

---

## 📖 Recursos Adicionais

### Documentação Interna

- `/.cursor/rules/` - Regras de desenvolvimento do projeto
- `/packages/ninetwo-front/README.md` - Docs do frontend
- `/packages/ninetwo-server/README.md` - Docs do backend

### Documentação Externa

- [NestJS Docs](https://docs.nestjs.com/)
- [React Docs](https://react.dev/)
- [GraphQL Docs](https://graphql.org/)
- [TypeORM Docs](https://typeorm.io/)
- [Recoil Docs](https://recoiljs.org/)
- [Nx Docs](https://nx.dev/)

### Ferramentas Úteis

- **GraphQL Playground:** `http://localhost:3000/graphql`
- **Storybook (UI):** `npx nx storybook:serve:dev ninetwo-front`
- **Nx Graph:** `npx nx graph`

---

## 🎓 Plano de Estudo Detalhado

Agora que você tem a visão geral, consulte os guias específicos:

1. **[Fase 1 - Fundamentos](./docs/estudo/fase-1-fundamentos.md)**
2. **[Fase 2 - Backend](./docs/estudo/fase-2-backend.md)**
3. **[Fase 3 - Frontend](./docs/estudo/fase-3-frontend.md)**
4. **[Fase 4 - Módulos de Negócio](./docs/estudo/fase-4-modulos-negocio.md)**
5. **[Fase 5 - Integrações](./docs/estudo/fase-5-integracoes.md)**
6. **[Fase 6 - DevOps](./docs/estudo/fase-6-devops.md)**

---

## 🤝 Próximos Passos

1. ✅ Leia este guia completamente
2. 📝 Configure seu ambiente de desenvolvimento
3. 🚀 Escolha uma abordagem de estudo (Top-Down ou Bottom-Up)
4. 📚 Comece pela Fase 1 do estudo detalhado
5. 💻 Pratique! Faça modificações no código
6. 📖 Documente o que aprendeu

---

**Última atualização:** Outubro 2025
**Versão do Guia:** 1.0.0

