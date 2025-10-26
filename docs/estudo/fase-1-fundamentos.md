# 📘 Fase 1: Fundamentos (1-2 semanas)

## Objetivos da Fase

Ao concluir esta fase, você será capaz de:
- ✅ Entender a arquitetura geral do Ninetwo
- ✅ Navegar pela estrutura do monorepo com confiança
- ✅ Conhecer as tecnologias principais do stack
- ✅ Configurar e rodar o projeto localmente

---

## 1.1 Arquitetura Geral do Projeto

### Conceitos Principais

O Ninetwo é construído como um **monorepo** gerenciado pelo **Nx**, contendo múltiplos pacotes interconectados. A arquitetura segue o padrão:

```
Cliente (Browser) → Frontend (React) → Backend (NestJS) → Database (PostgreSQL)
                                    ↓
                              External APIs (Google, Meta, etc)
```

### Arquitetura em Camadas

#### 1. Camada de Apresentação (Frontend)
- **Pacote:** `ninetwo-front`
- **Responsabilidade:** Interface do usuário, interações, visualização
- **Tecnologias:** React, Recoil, Apollo Client, Vite

#### 2. Camada de API (Backend - GraphQL)
- **Pacote:** `ninetwo-server`
- **Responsabilidade:** Expor API GraphQL, autenticação, autorização
- **Tecnologias:** NestJS, GraphQL Yoga, Passport

#### 3. Camada de Negócio (Backend - Modules)
- **Pacote:** `ninetwo-server/src/modules`
- **Responsabilidade:** Lógica de negócio, regras, processamento
- **Tecnologias:** NestJS Modules, Services, Repositories

#### 4. Camada de Dados (Backend - Database)
- **Pacote:** `ninetwo-server/src/database`
- **Responsabilidade:** Persistência, queries, migrations
- **Tecnologias:** TypeORM, PostgreSQL

#### 5. Camada de Infraestrutura
- **Responsabilidade:** Cache, filas, storage, observability
- **Tecnologias:** Redis, BullMQ, S3, OpenTelemetry

### Princípios Arquiteturais

1. **Separation of Concerns**: Cada pacote tem responsabilidade bem definida
2. **Dependency Injection**: Uso extensivo de DI para testabilidade
3. **Domain-Driven Design**: Módulos organizados por domínio de negócio
4. **API-First**: GraphQL como contrato entre frontend e backend
5. **Type Safety**: TypeScript em todo o codebase

### Diagrama de Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                      NINETWO ECOSYSTEM                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  ninetwo-front  │  │  ninetwo-ui     │  │ ninetwo-shared  │
│  (React App)    │──│  (Components)   │──│  (Types/Utils)  │
└────────┬────────┘  └─────────────────┘  └────────┬────────┘
         │                                           │
         │ GraphQL                                   │ Types
         │                                           │
┌────────▼───────────────────────────────────────────▼────────┐
│                     ninetwo-server                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Layer (GraphQL Resolvers)                       │  │
│  └─────────────────────┬────────────────────────────────┘  │
│  ┌─────────────────────▼────────────────────────────────┐  │
│  │  Business Modules (Services, Repositories)           │  │
│  └─────────────────────┬────────────────────────────────┘  │
│  ┌─────────────────────▼────────────────────────────────┐  │
│  │  Infrastructure (TypeORM, Redis, BullMQ)             │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼─────┐      ┌───────▼──────┐
         │ PostgreSQL │      │    Redis     │
         │  Database  │      │  Cache/Queue │
         └────────────┘      └──────────────┘
```

### Tarefas Práticas

- [ ] Desenhe seu próprio diagrama da arquitetura no papel
- [ ] Identifique onde cada pacote do monorepo se encaixa
- [ ] Liste 3 responsabilidades de cada camada
- [ ] Trace o fluxo de uma requisição do frontend ao banco

---

## 1.2 Estrutura do Monorepo (Nx)

### O que é um Monorepo?

Um monorepo é um repositório único que contém múltiplos projetos/pacotes relacionados. Vantagens:

- **Code Sharing:** Compartilhamento fácil de código entre projetos
- **Consistency:** Mesmas ferramentas e configurações em todos os pacotes
- **Refactoring:** Mudanças cross-project são mais fáceis
- **Atomic Changes:** Commits podem afetar múltiplos pacotes

### O que é Nx?

Nx é uma ferramenta de build system para monorepos que oferece:

- **Task Orchestration:** Executa tarefas em ordem correta
- **Caching:** Reutiliza resultados de builds anteriores
- **Dependency Graph:** Visualiza dependências entre projetos
- **Code Generation:** Generators para scaffolding

### Estrutura do Ninetwo Monorepo

```
ninetwo/
├── .cursor/                    # Regras de desenvolvimento
├── .github/                    # GitHub workflows
├── .yarn/                      # Yarn configs
├── docs/                       # Documentação (você está aqui!)
├── node_modules/               # Dependências
├── packages/                   # Todos os pacotes do projeto
│   ├── ninetwo-apps/          # Aplicações externas
│   ├── ninetwo-cli/           # CLI tool
│   ├── ninetwo-docker/        # Configs Docker/K8s
│   ├── ninetwo-e2e-testing/   # Testes E2E
│   ├── ninetwo-emails/        # Email templates
│   ├── ninetwo-front/         # ⭐ Frontend principal
│   ├── ninetwo-marketing-*/   # Módulos marketing
│   ├── ninetwo-sdk/           # SDK JavaScript
│   ├── ninetwo-server/        # ⭐ Backend principal
│   ├── ninetwo-shared/        # ⭐ Código compartilhado
│   ├── ninetwo-ui/            # ⭐ Biblioteca UI
│   ├── ninetwo-utils/         # Utils diversos
│   ├── ninetwo-website/       # Site marketing
│   └── ninetwo-zapier/        # Integração Zapier
├── tools/                      # Ferramentas build
│   └── eslint-rules/          # Rules customizadas
├── nx.json                     # Configuração Nx
├── package.json               # Dependências raiz
├── tsconfig.base.json         # TypeScript config base
└── yarn.lock                  # Lock file
```

### Pacotes Principais

#### 🎨 ninetwo-front
- **Tipo:** Aplicação React
- **Responsabilidade:** Interface do usuário
- **Tecnologias:** React, Vite, Recoil, Apollo Client
- **Output:** Bundle JavaScript para browser

#### 🚀 ninetwo-server
- **Tipo:** Aplicação NestJS
- **Responsabilidade:** API backend, lógica de negócio
- **Tecnologias:** NestJS, GraphQL, TypeORM
- **Output:** Node.js server

#### 🧩 ninetwo-shared
- **Tipo:** Biblioteca
- **Responsabilidade:** Tipos, interfaces, utils compartilhados
- **Usado por:** front + server
- **Output:** TypeScript declarations

#### 🎭 ninetwo-ui
- **Tipo:** Biblioteca de componentes
- **Responsabilidade:** Componentes UI reutilizáveis
- **Usado por:** front (principalmente)
- **Output:** React components

### Configuração Nx (nx.json)

```json
{
  "workspaceLayout": {
    "appsDir": "packages",
    "libsDir": "packages"
  },
  "targetDefaults": {
    "build": { "dependsOn": ["^build"], "cache": true },
    "test": { "cache": true },
    "lint": { "cache": true }
  }
}
```

**Explicação:**
- `workspaceLayout`: Define onde os pacotes ficam
- `targetDefaults`: Configurações padrão para tarefas
- `dependsOn: ["^build"]`: Builds dependentes rodam primeiro
- `cache: true`: Resultados são cacheados

### Comandos Nx Importantes

```bash
# Ver grafo de dependências (visual)
npx nx graph

# Rodar target em um projeto
npx nx <target> <project>
npx nx build ninetwo-front
npx nx test ninetwo-server

# Rodar target em múltiplos projetos
npx nx run-many --target=test --all
npx nx run-many --target=build --projects=ninetwo-front,ninetwo-server

# Rodar apenas o que foi afetado por mudanças
npx nx affected --target=test
npx nx affected --target=build --base=main

# Ver informações de um projeto
npx nx show project ninetwo-server
```

### Como Nx Gerencia Dependências

Cada pacote tem um `project.json` que define:

```json
{
  "name": "ninetwo-front",
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "options": { "outputPath": "dist/packages/ninetwo-front" }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "options": { "jestConfig": "packages/ninetwo-front/jest.config.mjs" }
    }
  }
}
```

### Grafo de Dependências

```
ninetwo-shared  ──┐
                  ├──> ninetwo-front
ninetwo-ui      ──┤       │
                  │       │ GraphQL
                  │       ▼
                  └──> ninetwo-server ───> PostgreSQL
                              │
                              ├──> Redis
                              └──> External APIs
```

### Tarefas Práticas

- [ ] Execute `npx nx graph` e explore o grafo visual
- [ ] Liste todas as dependências de `ninetwo-front`
- [ ] Identifique quais pacotes dependem de `ninetwo-shared`
- [ ] Crie um diagrama das dependências no papel
- [ ] Execute um build de todos os pacotes e observe a ordem

---

## 1.3 Stack Tecnológico

### Backend Technologies

#### 🏗️ NestJS (Framework)
- **Versão:** 9.4.3
- **Tipo:** Framework Node.js progressivo
- **Uso no Projeto:** Estrutura todo o backend
- **Conceitos Chave:**
  - Modules: Organização em módulos
  - Controllers: Endpoints REST (pouco usado)
  - Providers/Services: Lógica de negócio
  - Dependency Injection: Injeção automática
  - Decorators: @Injectable(), @Module(), etc

**Exemplo:**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

#### 🔷 GraphQL (API Layer)
- **Biblioteca:** GraphQL Yoga + Apollo Server
- **Versão:** 16.8.0
- **Uso:** Única API exposta pelo backend
- **Conceitos Chave:**
  - Schema: Definição de tipos e queries
  - Resolvers: Implementação das queries/mutations
  - Type Definitions: Geração automática
  - Subscriptions: Real-time updates

**Exemplo:**
```typescript
@Resolver(() => Company)
export class CompanyResolver {
  @Query(() => [Company])
  async companies(@Args() args: FindManyArgs) {
    return this.companyService.findAll(args);
  }

  @Mutation(() => Company)
  async createCompany(@Args('input') input: CreateCompanyInput) {
    return this.companyService.create(input);
  }
}
```

#### 🗃️ TypeORM (ORM)
- **Versão:** 0.3.20 (patched)
- **Database:** PostgreSQL
- **Uso:** Mapeamento objeto-relacional
- **Conceitos Chave:**
  - Entities: Classes que mapeiam tabelas
  - Repositories: Acesso ao banco
  - Migrations: Versionamento do schema
  - QueryBuilder: Construção de queries complexas

**Exemplo:**
```typescript
@Entity('company')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  website: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### 📮 BullMQ (Queue System)
- **Versão:** 5.40.0
- **Backend:** Redis
- **Uso:** Background jobs, tarefas assíncronas
- **Conceitos Chave:**
  - Jobs: Tarefas a serem processadas
  - Queues: Filas de jobs
  - Workers: Processadores de jobs
  - Schedulers: Jobs recorrentes (cron)

**Exemplo:**
```typescript
@Processor('email-import')
export class EmailImportProcessor {
  @Process('import-emails')
  async handleImport(job: Job) {
    const { accountId } = job.data;
    await this.emailService.importEmails(accountId);
  }
}
```

#### 🔐 Passport (Authentication)
- **Estratégias:** JWT, Google OAuth2, Microsoft OAuth2
- **Uso:** Autenticação e autorização
- **Conceitos Chave:**
  - Strategies: Métodos de autenticação
  - Guards: Proteção de rotas
  - JWT: Tokens stateless

### Frontend Technologies

#### ⚛️ React (UI Framework)
- **Versão:** 18.3.1
- **Uso:** Toda a interface do usuário
- **Conceitos Chave:**
  - Functional Components: Apenas componentes funcionais
  - Hooks: useState, useEffect, custom hooks
  - Context API: Compartilhamento de estado
  - Suspense: Carregamento assíncrono

**Exemplo:**
```typescript
export const CompanyList = () => {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetchCompanies().then(setCompanies);
  }, []);

  return (
    <div>
      {companies.map(company => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
};
```

#### 🔄 Recoil (State Management)
- **Versão:** 0.7.7
- **Uso:** Gerenciamento de estado global
- **Conceitos Chave:**
  - Atoms: Estados globais
  - Selectors: Estados derivados
  - useRecoilState: Hook para ler/escrever
  - useRecoilValue: Hook read-only

**Exemplo:**
```typescript
const companiesState = atom<Company[]>({
  key: 'companiesState',
  default: [],
});

const selectedCompanyIdState = atom<string | null>({
  key: 'selectedCompanyIdState',
  default: null,
});

// Em um componente
const [companies, setCompanies] = useRecoilState(companiesState);
const selectedId = useRecoilValue(selectedCompanyIdState);
```

#### 🚀 Apollo Client (GraphQL Client)
- **Versão:** 3.7.17
- **Uso:** Comunicação com backend GraphQL
- **Conceitos Chave:**
  - useQuery: Buscar dados
  - useMutation: Modificar dados
  - Cache: Cache inteligente
  - Optimistic Updates: UI instantânea

**Exemplo:**
```typescript
const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
      website
    }
  }
`;

const { data, loading, error } = useQuery(GET_COMPANIES);
```

#### ⚡ Vite (Build Tool)
- **Versão:** 7.0.0
- **Uso:** Build e dev server
- **Vantagens:**
  - Hot Module Replacement (HMR) ultra-rápido
  - Build otimizado com Rollup
  - Support nativo para TypeScript
  - Tree-shaking automático

### Database & Storage

#### 🐘 PostgreSQL
- **Versão:** 14+
- **Uso:** Banco de dados principal
- **Features Usadas:**
  - JSONB: Campos JSON
  - UUID: IDs únicos
  - Full-Text Search: Busca textual
  - Constraints: Validações no DB

#### 🔴 Redis
- **Versão:** 5.6.0 (ioredis client)
- **Uso:** Cache e filas
- **Features:**
  - Cache de queries GraphQL
  - Session storage
  - BullMQ backend
  - Pub/Sub para subscriptions

### DevOps & Tools

#### 📦 Nx
- **Versão:** 21.3.11
- **Uso:** Monorepo management
- **Features:**
  - Task orchestration
  - Build caching
  - Dependency graph
  - Code generation

#### 🧪 Jest (Testing)
- **Versão:** 29.7.0
- **Uso:** Unit e integration tests
- **Features:**
  - Snapshots
  - Mocking
  - Coverage reports
  - Watch mode

#### 🎭 Playwright (E2E Testing)
- **Versão:** 1.46.0
- **Uso:** Testes end-to-end
- **Features:**
  - Multi-browser testing
  - Screenshots/videos
  - Network mocking
  - Parallel execution

### Integrações Externas

#### Google Ecosystem
- **Google Ads API:** Dados de campanhas
- **Google Analytics Data API:** Analytics
- **Gmail API:** Integração de emails
- **Google OAuth2:** Autenticação

#### Meta (Facebook)
- **Facebook Business SDK:** Ads Manager
- **Meta OAuth:** Autenticação

#### AI/LLM
- **OpenAI:** GPT models
- **Anthropic:** Claude models
- **xAI:** Grok models

### Tarefas Práticas

- [ ] Crie um mapa mental das tecnologias por camada
- [ ] Para cada tech, anote: versão, uso, 3 conceitos chave
- [ ] Identifique quais tecnologias você já conhece
- [ ] Liste as tecnologias que precisa estudar mais
- [ ] Configure um ambiente de estudo para cada tech nova

---

## 1.4 Setup do Ambiente de Desenvolvimento

### Pré-requisitos

Antes de começar, instale:

#### Obrigatórios
- ✅ **Node.js:** v24.5.0 (exatamente essa versão!)
- ✅ **Yarn:** v4.0.2 ou superior
- ✅ **PostgreSQL:** v14 ou superior
- ✅ **Redis:** v6 ou superior
- ✅ **Git:** Qualquer versão recente

#### Recomendados
- 📝 **VSCode** ou **Cursor** (IDE)
- 🐳 **Docker & Docker Compose** (para services)
- 🔧 **Postman** ou **Insomnia** (para testar APIs)

### Instalação Passo a Passo

#### 1. Instalar Node.js v24.5.0

```bash
# Usando nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 24.5.0
nvm use 24.5.0
nvm alias default 24.5.0

# Verificar
node --version  # Deve mostrar v24.5.0
```

#### 2. Instalar Yarn v4

```bash
# Habilitar Corepack (vem com Node.js)
corepack enable

# Verificar
yarn --version  # Deve mostrar 4.x.x
```

#### 3. Instalar PostgreSQL e Redis (Docker - Recomendado)

```bash
# Navegar para pasta docker
cd packages/ninetwo-docker

# Iniciar serviços
docker-compose up -d postgres redis

# Verificar se estão rodando
docker-compose ps
```

**Portas:**
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

**Alternativa sem Docker:**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql redis-server

# macOS
brew install postgresql@14 redis

# Iniciar serviços
sudo systemctl start postgresql
sudo systemctl start redis
```

#### 4. Clonar e Configurar Projeto

```bash
# Clonar repositório
git clone <repo-url> ninetwo
cd ninetwo

# Instalar dependências
yarn install

# Copiar env example
cp packages/ninetwo-server/.env.example packages/ninetwo-server/.env
cp packages/ninetwo-front/.env.example packages/ninetwo-front/.env

# Editar arquivos .env com suas configurações
# - Database credentials
# - Redis URL
# - JWT secret
# - OAuth credentials (opcional para início)
```

#### 5. Configurar Banco de Dados

```bash
# Criar database
createdb ninetwo_dev

# Ou via SQL
psql -U postgres
CREATE DATABASE ninetwo_dev;
\q

# Rodar migrations
cd packages/ninetwo-server
npx nx database:init:prod ninetwo-server
```

#### 6. Iniciar Aplicação

```bash
# Opção 1: Tudo de uma vez (recomendado)
yarn start

# Opção 2: Separadamente
# Terminal 1 - Backend
npx nx start ninetwo-server

# Terminal 2 - Frontend
npx nx start ninetwo-front

# Terminal 3 - Worker (opcional, para background jobs)
npx nx worker ninetwo-server
```

#### 7. Verificar Instalação

- ✅ **Frontend:** http://localhost:3001
- ✅ **Backend API:** http://localhost:3000
- ✅ **GraphQL Playground:** http://localhost:3000/graphql

### Configuração do .env

#### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ninetwo_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-this

# Server
NODE_PORT=3000
FRONTEND_URL=http://localhost:3001

# Storage (opcional no início)
# STORAGE_TYPE=local
# STORAGE_LOCAL_PATH=./storage

# OAuth (opcional no início)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
```

#### Frontend (.env)

```bash
# API
VITE_API_URL=http://localhost:3000/graphql

# App
VITE_APP_URL=http://localhost:3001
```

### Troubleshooting Comum

#### Erro: Port already in use

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>
```

#### Erro: Cannot connect to database

```bash
# Verificar se PostgreSQL está rodando
pg_isready

# Verificar credenciais no .env
# Tentar conectar manualmente
psql -h localhost -U postgres -d ninetwo_dev
```

#### Erro: Redis connection refused

```bash
# Verificar se Redis está rodando
redis-cli ping
# Deve retornar: PONG

# Iniciar Redis se necessário
redis-server
```

#### Erro: Yarn install falha

```bash
# Limpar cache
yarn cache clean

# Deletar node_modules e reinstalar
rm -rf node_modules
yarn install

# Verificar versão do Node
node --version  # Deve ser v24.5.0
```

### Configuração do Editor (VSCode/Cursor)

#### Extensões Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "GraphQL.vscode-graphql",
    "bradlc.vscode-tailwindcss",
    "nrwl.angular-console"
  ]
}
```

#### Settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

### Scripts Úteis

```bash
# Limpar tudo e recomeçar
yarn clean
rm -rf node_modules
yarn install

# Rebuild todos os pacotes
npx nx run-many --target=build --all

# Resetar banco de dados
npx nx database:reset ninetwo-server

# Ver logs detalhados
DEBUG=* yarn start

# Rodar em modo produção localmente
NODE_ENV=production yarn start
```

### Próximos Passos Após Setup

1. ✅ Criar uma conta de usuário no app
2. ✅ Explorar o GraphQL Playground
3. ✅ Fazer sua primeira query GraphQL
4. ✅ Criar uma Company via UI
5. ✅ Verificar o dado no banco: `psql ninetwo_dev`

### Tarefas Práticas

- [ ] Complete todos os passos de instalação
- [ ] Verifique que tudo está rodando sem erros
- [ ] Crie um usuário e faça login
- [ ] Execute uma query no GraphQL Playground
- [ ] Configure breakpoints no VSCode e debug o backend
- [ ] Configure breakpoints no browser e debug o frontend
- [ ] Explore o banco de dados com um client SQL

---

## 🎯 Checklist de Conclusão da Fase 1

Antes de avançar para a Fase 2, certifique-se que você:

- [ ] Entende a arquitetura em camadas do Ninetwo
- [ ] Sabe navegar pela estrutura do monorepo
- [ ] Conhece o papel de cada pacote principal
- [ ] Entende como o Nx gerencia dependências
- [ ] Conhece as tecnologias principais de cada camada
- [ ] Tem o ambiente local completamente funcional
- [ ] Consegue rodar frontend + backend + worker
- [ ] Fez sua primeira modificação no código
- [ ] Commitou uma mudança pequena no Git

---

## 📚 Recursos de Estudo Recomendados

### Documentação Oficial
- [NestJS Fundamentals](https://docs.nestjs.com/)
- [React Beta Docs](https://react.dev/)
- [GraphQL Introduction](https://graphql.org/learn/)
- [Nx Getting Started](https://nx.dev/getting-started/intro)
- [Recoil Basics](https://recoiljs.org/docs/introduction/getting-started)

### Tutoriais Práticos
- [NestJS + GraphQL Tutorial](https://docs.nestjs.com/graphql/quick-start)
- [React + Apollo Client](https://www.apollographql.com/docs/react/)
- [TypeORM Guide](https://typeorm.io/working-with-entity-manager)

### Vídeos
- [What is a Monorepo?](https://www.youtube.com/results?search_query=monorepo+explained)
- [NestJS Crash Course](https://www.youtube.com/results?search_query=nestjs+crash+course)
- [React Hooks Deep Dive](https://www.youtube.com/results?search_query=react+hooks+deep+dive)

---

**Próxima Fase:** [Fase 2 - Backend](./fase-2-backend.md)

**Última atualização:** Outubro 2025

