# ⚡ Referência Rápida - Ninetwo

Guia de consulta rápida para desenvolvimento no Ninetwo.

---

## 🚀 Comandos Essenciais

### Desenvolvimento
```bash
# Iniciar tudo
yarn start

# Apenas backend
npx nx start ninetwo-server

# Apenas frontend
npx nx start ninetwo-front

# Worker (background jobs)
npx nx worker ninetwo-server
```

### GraphQL
```bash
# Regenerar tipos (SEMPRE após mudar schema)
npx nx graphql:generate ninetwo-front

# GraphQL Playground
# http://localhost:3000/graphql
```

### Database
```bash
# Criar migration
npx typeorm migration:generate \
  src/database/typeorm/core/migrations/NomeDaMigracao \
  -d src/database/typeorm/core/core.datasource.ts

# Rodar migrations
npx nx database:migrate:prod ninetwo-server

# Reset banco (CUIDADO!)
npx nx database:reset ninetwo-server
```

### Testing
```bash
# Testes backend
npx nx test ninetwo-server

# Testes frontend
npx nx test ninetwo-front

# Lint
npx nx lint ninetwo-server
npx nx lint ninetwo-front

# Type check
npx nx typecheck ninetwo-server
npx nx typecheck ninetwo-front
```

---

## 📁 Estrutura de Módulos (Padrão Correto)

### Template de Módulo

```
module-name/
├── module-name.module.ts        ← Apenas agregador
│   @Module({
│     imports: [Submódulos],
│     providers: [],  ← VAZIO
│     exports: [],    ← VAZIO
│   })
│
├── common/                      ← Entities compartilhadas
│   ├── module-common.module.ts
│   ├── standard-objects/
│   │   └── *.workspace-entity.ts
│   └── services/
│       └── sync-status.service.ts
│
├── module-import-manager/       ← Background sync
│   ├── crons/
│   ├── jobs/
│   ├── drivers/
│   └── services/
│
└── module-feature-manager/      ← Features específicas
    ├── jobs/
    ├── listeners/
    └── services/
```

### Exemplos de Referência

**✅ Seguem o padrão:**
- `calendar/` → Modelo perfeito
- `messaging/` → Modelo perfeito

**⚠️ Precisam refatoração:**
- `marketing/` → 60% conforme

---

## 🗄️ Database (TypeORM)

### Entity Decorators

```typescript
@Entity('table_name')
@PrimaryGeneratedColumn('uuid')
@Column({ type: 'varchar', nullable: true, unique: true })
@CreateDateColumn()
@UpdateDateColumn()
@DeleteDateColumn()

// Relacionamentos
@ManyToOne(() => Company, (company) => company.people)
@JoinColumn({ name: 'company_id' })

@OneToMany(() => Activity, (activity) => activity.person)

@ManyToMany(() => Tag)
@JoinTable({ name: 'person_tags' })
```

### Repository Pattern

```typescript
@Injectable()
export class MyService {
  constructor(
    @InjectRepository(Entity)
    private repository: Repository<Entity>,
  ) {}

  async findAll() {
    return this.repository.find();
  }

  async findOne(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async create(input: CreateInput) {
    const entity = this.repository.create(input);
    return this.repository.save(entity);
  }

  async update(id: string, input: UpdateInput) {
    await this.repository.update(id, input);
    return this.findOne(id);
  }

  async delete(id: string) {
    await this.repository.softDelete(id);
  }
}
```

---

## 🔷 GraphQL (Code-First)

### Definir Types

```typescript
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class MyType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  count: number;

  @Field(() => [RelatedType])
  relations: RelatedType[];
}
```

### Inputs

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}
```

### Resolvers

```typescript
@Resolver(() => MyType)
export class MyResolver {
  constructor(private service: MyService) {}

  @Query(() => [MyType])
  @UseGuards(JwtAuthGuard)
  async items(@CurrentWorkspace() workspace: Workspace) {
    return this.service.findAll(workspace.id);
  }

  @Mutation(() => MyType)
  @UseGuards(JwtAuthGuard)
  async createItem(
    @Args('input') input: CreateInput,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    return this.service.create(input, workspace.id);
  }

  @ResolveField(() => RelatedType)
  async related(@Parent() parent: MyType) {
    return this.relatedService.findByParentId(parent.id);
  }
}
```

---

## ⚛️ Frontend (React)

### Component Structure

```typescript
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRecoilState } from 'recoil';
import styled from '@emotion/styled';

type MyComponentProps = {
  id: string;
  onSelect?: (id: string) => void;
};

export const MyComponent = ({ id, onSelect }: MyComponentProps) => {
  const [localState, setLocalState] = useState('');
  const [globalState, setGlobalState] = useRecoilState(myAtom);

  const { data, loading } = useQuery(GET_ITEMS);
  const [mutate] = useMutation(CREATE_ITEM);

  const handleAction = () => {
    onSelect?.(id);
  };

  if (loading) return <Loading />;

  return (
    <StyledContainer>
      {/* JSX */}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding: 16px;
`;
```

### Recoil State

```typescript
// Atom
export const itemsState = atom<Item[]>({
  key: 'itemsState',
  default: [],
});

// Selector
export const filteredItemsSelector = selector<Item[]>({
  key: 'filteredItemsSelector',
  get: ({ get }) => {
    const items = get(itemsState);
    const filter = get(filterState);
    return items.filter(/* logic */);
  },
});

// Uso
const items = useRecoilValue(itemsState);
const [items, setItems] = useRecoilState(itemsState);
const setItems = useSetRecoilState(itemsState);
```

---

## 🔄 Background Jobs (BullMQ)

### Definir Job

```typescript
export type MyJobData = {
  itemId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.myQueue,
  scope: Scope.REQUEST,
})
export class MyJob {
  constructor(private service: MyService) {}

  @Process(MyJob.name)
  async handle(data: MyJobData): Promise<void> {
    const { itemId, workspaceId } = data;

    await this.service.process(itemId, workspaceId);
  }
}
```

### Adicionar Job à Fila

```typescript
@Injectable()
export class MyService {
  constructor(
    @InjectMessageQueue(MessageQueue.myQueue)
    private messageQueueService: MessageQueueService,
  ) {}

  async scheduleJob(itemId: string) {
    await this.messageQueueService.add<MyJobData>(
      MyJob.name,
      { itemId, workspaceId },
    );
  }
}
```

### Cron Job

```typescript
export const MY_CRON_PATTERN = '*/5 * * * *'; // A cada 5 minutos

@Processor({ queueName: MessageQueue.cronQueue })
export class MyCronJob {
  @Process(MyCronJob.name)
  @SentryCronMonitor(MyCronJob.name, MY_CRON_PATTERN)
  async handle(): Promise<void> {
    // Lógica que roda periodicamente
  }
}
```

---

## 🔐 Autenticação

### Guards

```typescript
// JWT Auth
@Query(() => MyType)
@UseGuards(JwtAuthGuard)
async myQuery(@CurrentUser() user: User) {
  // user está disponível
}

// JWT + Workspace
@Query(() => MyType)
@UseGuards(JwtAuthGuard, WorkspaceGuard)
async myQuery(@CurrentWorkspace() workspace: Workspace) {
  // workspace está disponível
}
```

### Custom Decorators

```typescript
// Uso
@Query(() => MyType)
async myQuery(
  @CurrentUser() user: User,
  @CurrentWorkspace() workspace: Workspace,
  @Args('id') id: string,
) {
  return this.service.findOne(id, workspace.id);
}
```

---

## 🔄 Event-Driven Architecture

### Emitir Evento

```typescript
@Injectable()
export class MyService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(input: CreateInput) {
    const item = await this.repository.save(input);

    this.eventEmitter.emit('item.created', {
      item,
      workspaceId: item.workspaceId,
    });

    return item;
  }
}
```

### Listener

```typescript
@Injectable()
export class MyListener {
  @OnEvent('item.created')
  async handleItemCreated(payload: { item: Item }) {
    // Reage ao evento
    await this.doSomething(payload.item);
  }
}
```

---

## 📊 Fluxo Típico de Request

```
1. FRONTEND
   └─ useQuery(GET_ITEMS)

2. APOLLO CLIENT
   └─ POST /graphql
      Body: { query: "query { items { ... } }" }
      Headers: { Authorization: "Bearer <token>" }

3. BACKEND - GraphQL Layer
   └─ JwtAuthGuard verifica token
   └─ WorkspaceGuard verifica workspace
   └─ Resolver.items() é chamado

4. BACKEND - Service Layer
   └─ Service.findAll(workspaceId)

5. BACKEND - Repository Layer
   └─ Repository.find({ where: { workspaceId } })

6. DATABASE
   └─ SELECT * FROM workspace_xxx.items WHERE workspace_id = '...'

7. RESPONSE
   └─ GraphQL serializa resposta
   └─ Cliente recebe JSON
   └─ Apollo cache update
   └─ Component re-render
```

---

## 🎨 Padrões de Código

### TypeScript

```typescript
// ✅ Named exports
export const MyComponent = () => {};
export const myFunction = () => {};
export type MyType = {};

// ❌ Default exports
export default MyComponent;

// ✅ Types over interfaces
type UserProps = { name: string };

// ❌ Interfaces (exceto para extend)
interface UserProps { name: string }

// ✅ Const over let
const value = 'abc';

// ❌ Let desnecessário
let value = 'abc'; // se não vai reatribuir
```

### Naming

```typescript
// Variables/Functions: camelCase
const userName = 'John';
const fetchUserData = () => {};

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// Types/Classes: PascalCase
type UserData = {};
class UserService {}

// Files: kebab-case
// user-profile.component.tsx
// user-profile.styles.ts
```

---

## 📚 Documentos de Estudo

### Ordem Recomendada

1. **[GUIA-DE-ESTUDO.md](../../GUIA-DE-ESTUDO.md)** - Comece aqui
2. **[FLUXO-CALENDAR-COMPLETO.md](./FLUXO-CALENDAR-COMPLETO.md)** - Entenda um módulo completo
3. **[COMPARACAO-MODULOS.md](./COMPARACAO-MODULOS.md)** - Padrões corretos
4. **[fase-1-fundamentos.md](./fase-1-fundamentos.md)** - Setup e fundamentos
5. **[fase-2-backend.md](./fase-2-backend.md)** - Backend detalhado
6. **[fase-3-frontend.md](./fase-3-frontend.md)** - Frontend detalhado

---

## 🔍 Onde Encontrar...

### "Onde está a lógica de X?"

```
Authentication       → engine/core-modules/auth/
Database config      → database/typeorm/
GraphQL setup        → engine/api/graphql/
Workspace logic      → engine/workspace-manager/
CRM entities         → modules/company/, modules/person/, etc
Background jobs      → modules/*/jobs/
Cron jobs            → modules/*/crons/jobs/
External APIs        → modules/*/drivers/
UI Components        → ninetwo-ui/src/
Shared types         → ninetwo-shared/src/
```

### "Qual arquivo devo modificar para...?"

```
Adicionar campo entity     → modules/*/standard-objects/*.workspace-entity.ts
Modificar lógica negócio   → modules/*/services/*.service.ts
Adicionar API GraphQL      → modules/*/resolvers/*.resolver.ts
Criar background job       → modules/*/jobs/*.job.ts
Criar cron job             → modules/*/crons/jobs/*.cron.job.ts
Adicionar página frontend  → ninetwo-front/src/pages/
Adicionar componente       → ninetwo-front/src/modules/ui/
```

---

## 🎯 Checklist de Mudanças

### Mudei uma Entity:
- [ ] Criar migration: `npx typeorm migration:generate`
- [ ] Rodar migration: `npx nx database:migrate:prod ninetwo-server`
- [ ] Se mudou GraphQL: `npx nx graphql:generate ninetwo-front`

### Mudei GraphQL Schema:
- [ ] Regenerar tipos: `npx nx graphql:generate ninetwo-front`
- [ ] Verificar no Playground: `http://localhost:3000/graphql`

### Criei novo Módulo:
- [ ] Criar estrutura de pastas (seguir padrão Calendar)
- [ ] Criar `module-name.module.ts` (apenas agregador)
- [ ] Criar `common/` com entities
- [ ] Importar em `modules.module.ts`
- [ ] Rodar `npx nx database:sync` (dev) ou criar migrations

### Adicionei Background Job:
- [ ] Criar `*.job.ts` com `@Processor` e `@Process`
- [ ] Registrar no módulo correspondente
- [ ] Testar adicionando job manualmente
- [ ] Verificar logs do worker

---

## 🐛 Troubleshooting

### "Type X not found" no Frontend
```bash
npx nx graphql:generate ninetwo-front
```

### "Column X does not exist"
```bash
npx nx database:migrate:prod ninetwo-server
```

### "Module X not found"
```bash
# Rebuild do pacote
npx nx build ninetwo-shared
npx nx build ninetwo-ui
```

### "Port already in use"
```bash
# Matar processos nas portas
kill -9 $(lsof -ti:3000)  # Backend
kill -9 $(lsof -ti:3001)  # Frontend
```

### Cache/Build issues
```bash
# Limpar tudo
rm -rf node_modules/.cache
rm -rf dist
yarn install
npx nx run-many --target=build --all
```

---

## 📖 Leitura Obrigatória

### Regras de Desenvolvimento
- `.cursor/rules/` - Todas as regras do projeto

### Principais Regras:
- ✅ Named exports only (no default)
- ✅ Functional components only
- ✅ Types over interfaces
- ✅ No 'any' type
- ✅ Event handlers over useEffect
- ✅ kebab-case para arquivos

---

## 🎓 Recursos Externos

### Documentação
- [NestJS](https://docs.nestjs.com/)
- [React](https://react.dev/)
- [GraphQL](https://graphql.org/learn/)
- [TypeORM](https://typeorm.io/)
- [Recoil](https://recoiljs.org/)
- [Nx](https://nx.dev/)

### Tools
- GraphQL Playground: `http://localhost:3000/graphql`
- Nx Graph: `npx nx graph`
- Storybook: `npx nx storybook:serve:dev ninetwo-front`

---

## 💡 Dicas de Ouro

1. **Sempre use Calendar como referência** para estrutura de módulos
2. **Sempre regenere tipos GraphQL** após mudar schema
3. **Sempre crie migrations** para mudanças no banco
4. **Sempre teste no GraphQL Playground** antes de usar no frontend
5. **Sempre siga as regras** em `.cursor/rules/`

---

**Esta é sua referência rápida. Consulte quando tiver dúvidas! 🚀**

**Última atualização:** Outubro 2025

