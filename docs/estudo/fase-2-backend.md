# 🔧 Fase 2: Backend (2-3 semanas)

## Objetivos da Fase

Ao concluir esta fase, você será capaz de:
- ✅ Entender a estrutura modular do NestJS
- ✅ Navegar e modificar módulos de negócio
- ✅ Trabalhar com TypeORM e banco de dados
- ✅ Criar e modificar APIs GraphQL
- ✅ Implementar autenticação e autorização

---

## 2.1 Estrutura do NestJS

### Conceitos Fundamentais

NestJS é um framework opinativo que força uma estrutura bem organizada. Os conceitos principais são:

#### 🎯 Modules (Módulos)
Agrupam funcionalidades relacionadas.

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Company])],  // Outros módulos
  controllers: [CompanyController],                 // Controllers (REST)
  providers: [CompanyService, CompanyRepository],   // Services
  exports: [CompanyService],                        // Expor para outros módulos
})
export class CompanyModule {}
```

#### 🎭 Providers (Provedores)
Classes que podem ser injetadas (Services, Repositories, Factories, etc).

```typescript
@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }
}
```

#### 🎪 Controllers (Controladores)
Gerenciam requisições HTTP (REST). No Ninetwo, **usamos GraphQL**, então controllers são raros.

```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```

#### 🔌 Dependency Injection (Injeção de Dependência)
Core do NestJS. Tudo é injetado automaticamente.

```typescript
export class CompanyService {
  // Injeta automaticamente
  constructor(
    private companyRepository: Repository<Company>,
    private userService: UserService,  // Outro service
    private logger: LoggerService,     // Logger
  ) {}
}
```

### Estrutura do ninetwo-server

```
src/
├── main.ts                           # Bootstrap da aplicação
├── app.module.ts                     # Módulo raiz
├── engine/                           # Core do sistema
│   ├── api/                          # Setup GraphQL, REST
│   │   ├── graphql/                  # GraphQL configuration
│   │   └── rest/                     # REST endpoints (poucos)
│   ├── core-modules/                 # Módulos fundamentais
│   │   ├── auth/                     # Autenticação
│   │   ├── ninetwo-config/          # Configurações
│   │   ├── logger/                   # Sistema de logs
│   │   ├── cache/                    # Cache manager
│   │   └── session-storage/          # Sessões
│   ├── workspace-manager/            # Multi-workspace
│   ├── metadata/                     # Sistema de metadados
│   └── integrations/                 # Integrações externas
├── modules/                          # Módulos de negócio
│   ├── modules.module.ts            # Agregador
│   ├── company/                      # Empresas
│   ├── person/                       # Contatos
│   ├── opportunity/                  # Oportunidades
│   ├── marketing/                    # Marketing
│   ├── messaging/                    # Mensagens/Email
│   ├── calendar/                     # Calendário
│   ├── workflow/                     # Automação
│   └── ...                           # Outros módulos
├── database/                         # Database config
│   ├── typeorm/                      # TypeORM setup
│   │   ├── core.datasource.ts       # Configuração principal
│   │   └── migrations/               # Migrations
│   └── clickhouse/                   # ClickHouse (analytics)
├── filters/                          # Exception filters
├── guards/                           # Auth guards
├── decorators/                       # Custom decorators
├── utils/                            # Utilitários
└── types/                            # Type definitions
```

### Fluxo de uma Requisição

```
1. Cliente faz requisição GraphQL
   ↓
2. GraphQL Yoga recebe (engine/api/graphql)
   ↓
3. Middleware & Guards verificam autenticação
   ↓
4. Resolver é chamado (modules/*/resolvers)
   ↓
5. Service executa lógica de negócio (modules/*/services)
   ↓
6. Repository acessa banco de dados (TypeORM)
   ↓
7. Hooks de pré/pós processamento rodam (query-hooks)
   ↓
8. Response é serializado e enviado
```

### Tarefas Práticas

- [ ] Navegue por `app.module.ts` e identifique todos os imports
- [ ] Abra `modules/company/` e mapeie: entity, service, resolver
- [ ] Trace uma requisição completa no debugger
- [ ] Adicione um log em um service e observe no console
- [ ] Crie um módulo novo simples (ex: Note)

---

## 2.2 Sistema de Módulos

### Estrutura de um Módulo Típico

```
modules/company/
├── company.module.ts                 # Definição do módulo
├── services/
│   └── company.service.ts           # Lógica de negócio
├── repositories/
│   └── company.repository.ts        # Acesso ao banco (custom)
├── resolvers/
│   └── company.resolver.ts          # GraphQL resolver
├── standard-objects/
│   └── company.workspace-entity.ts  # Entity TypeORM
├── query-hooks/
│   ├── company-create.pre-query.hook.ts
│   └── company-update.post-query.hook.ts
├── listeners/
│   └── company.listener.ts          # Event listeners
├── jobs/
│   └── company-sync.job.ts          # Background jobs
├── dto/
│   ├── create-company.input.ts      # Input DTOs
│   └── update-company.input.ts
├── types/
│   └── company.types.ts             # Type definitions
└── utils/
    └── company.utils.ts             # Helpers
```

### Exemplo: Módulo Company Completo

#### 1. Entity (TypeORM)

```typescript
// standard-objects/company.workspace-entity.ts
@Entity('company')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  domainName: string;

  @Column({ type: 'integer', default: 0 })
  employees: number;

  @Column({ type: 'jsonb', nullable: true })
  address: Address;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relacionamentos
  @OneToMany(() => Person, (person) => person.company)
  people: Person[];

  @OneToMany(() => Opportunity, (opportunity) => opportunity.company)
  opportunities: Opportunity[];
}
```

#### 2. Service (Business Logic)

```typescript
// services/company.service.ts
@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(workspaceId: string): Promise<Company[]> {
    return this.companyRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id, workspaceId },
      relations: ['people', 'opportunities'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async create(
    input: CreateCompanyInput,
    workspaceId: string,
  ): Promise<Company> {
    // Enrich data se tiver website
    if (input.website) {
      input.domainName = this.extractDomain(input.website);
    }

    const company = this.companyRepository.create({
      ...input,
      workspaceId,
    });

    const saved = await this.companyRepository.save(company);

    // Emit event para outros módulos reagirem
    this.eventEmitter.emit('company.created', { company: saved });

    return saved;
  }

  async update(
    id: string,
    input: UpdateCompanyInput,
    workspaceId: string,
  ): Promise<Company> {
    const company = await this.findOne(id, workspaceId);

    Object.assign(company, input);

    const updated = await this.companyRepository.save(company);

    this.eventEmitter.emit('company.updated', { company: updated });

    return updated;
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    const company = await this.findOne(id, workspaceId);

    await this.companyRepository.softDelete(id);

    this.eventEmitter.emit('company.deleted', { companyId: id });
  }

  private extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return '';
    }
  }
}
```

#### 3. Resolver (GraphQL)

```typescript
// resolvers/company.resolver.ts
@Resolver(() => Company)
export class CompanyResolver {
  constructor(private companyService: CompanyService) {}

  @Query(() => [Company])
  @UseGuards(JwtAuthGuard)
  async companies(
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Company[]> {
    return this.companyService.findAll(workspace.id);
  }

  @Query(() => Company)
  @UseGuards(JwtAuthGuard)
  async company(
    @Args('id') id: string,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Company> {
    return this.companyService.findOne(id, workspace.id);
  }

  @Mutation(() => Company)
  @UseGuards(JwtAuthGuard)
  async createCompany(
    @Args('input') input: CreateCompanyInput,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Company> {
    return this.companyService.create(input, workspace.id);
  }

  @Mutation(() => Company)
  @UseGuards(JwtAuthGuard)
  async updateCompany(
    @Args('id') id: string,
    @Args('input') input: UpdateCompanyInput,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Company> {
    return this.companyService.update(id, input, workspace.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteCompany(
    @Args('id') id: string,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    await this.companyService.delete(id, workspace.id);
    return true;
  }

  // Field Resolver - lazy load relacionamentos
  @ResolveField(() => [Person])
  async people(@Parent() company: Company): Promise<Person[]> {
    // TypeORM lazy loading
    return company.people || [];
  }
}
```

#### 4. Module Definition

```typescript
// company.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    PersonModule,  // Para relacionamentos
  ],
  providers: [
    CompanyService,
    CompanyResolver,
  ],
  exports: [CompanyService],  // Outros módulos podem usar
})
export class CompanyModule {}
```

### Módulos Importantes no Ninetwo

#### 1. Marketing Module
```
modules/marketing/
├── common/                           # Shared marketing code
│   ├── services/
│   │   └── marketing-channel-sync-status.service.ts
│   └── standard-objects/
│       ├── marketing-channel.workspace-entity.ts
│       └── analytics-data.workspace-entity.ts
├── marketing-import-manager/         # Importação de dados
│   ├── services/
│   │   └── drivers/
│   │       ├── google-ads-data-fetch.service.ts
│   │       └── google-analytics-data-fetch.service.ts
│   └── marketing-import-manager.module.ts
└── marketing.module.ts
```

**Funcionalidades:**
- Sincronização de dados do Google Ads
- Importação de Analytics do Google Analytics
- Dashboard de métricas de marketing

#### 2. Messaging Module
```
modules/messaging/
├── common/                           # Core messaging
├── message-import-manager/           # Import de emails
│   ├── drivers/
│   │   ├── gmail/
│   │   └── outlook/
│   └── services/
├── message-cleaner/                  # Limpeza de mensagens antigas
└── messaging.module.ts
```

**Funcionalidades:**
- Integração com Gmail/Outlook
- Import de emails via IMAP
- Threading de conversas
- Sincronização bidirecional

#### 3. Workflow Module
```
modules/workflow/
├── workflow-builder/                 # Editor de workflows
├── workflow-executor/                # Execução de workflows
│   ├── actions/                      # Ações disponíveis
│   └── triggers/                     # Triggers disponíveis
├── workflow-runner/                  # Runner de workflows
└── workflow.module.ts
```

**Funcionalidades:**
- Automação visual (low-code)
- Triggers (webhook, schedule, event)
- Actions (email, HTTP, database)
- Conditional logic

#### 4. Calendar Module
```
modules/calendar/
├── calendar-event-import-manager/    # Import de eventos
│   └── drivers/
│       ├── google-calendar/
│       └── outlook-calendar/
├── calendar-event-participant-manager/
└── calendar.module.ts
```

**Funcionalidades:**
- Sincronização de calendários
- Participantes de eventos
- Integração com Google/Outlook

### Event-Driven Architecture

Módulos comunicam via eventos:

```typescript
// Emissor (em CompanyService)
this.eventEmitter.emit('company.created', {
  company: savedCompany,
  workspaceId,
});

// Listener (em outro módulo)
@OnEvent('company.created')
async handleCompanyCreated(payload: { company: Company }) {
  // Criar timeline activity
  await this.timelineService.createActivity({
    type: 'company.created',
    companyId: payload.company.id,
  });
}
```

### Tarefas Práticas

- [ ] Escolha um módulo e mapeie todos os seus componentes
- [ ] Trace um fluxo completo: resolver → service → repository
- [ ] Adicione um campo novo em uma entity e faça migration
- [ ] Crie um event listener para reagir a uma ação
- [ ] Implemente um novo método em um service existente

---

## 2.3 Database & TypeORM

### Configuração do TypeORM

```typescript
// database/typeorm/core.datasource.ts
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.workspace-entity.js'],
  migrations: ['dist/database/typeorm/core/migrations/*.js'],
  synchronize: false,  // NUNCA true em produção!
  logging: process.env.NODE_ENV === 'development',
});
```

### Entities (Modelos)

#### Decorators Principais

```typescript
@Entity('table_name')                  // Define tabela
@PrimaryGeneratedColumn('uuid')        // ID auto-gerado
@Column({ type: 'varchar', length: 255 }) // Coluna básica
@Column({ nullable: true })            // Opcional
@Column({ default: 0 })                // Valor padrão
@Column({ type: 'jsonb' })             // JSON no PostgreSQL
@Column({ unique: true })              // Constraint unique
@CreateDateColumn()                    // Auto timestamp criação
@UpdateDateColumn()                    // Auto timestamp update
@DeleteDateColumn()                    // Soft delete
```

#### Relacionamentos

```typescript
// One-to-Many
@OneToMany(() => Person, (person) => person.company)
people: Person[];

// Many-to-One
@ManyToOne(() => Company, (company) => company.people)
@JoinColumn({ name: 'company_id' })
company: Company;

// Many-to-Many
@ManyToMany(() => Tag)
@JoinTable({ name: 'company_tags' })
tags: Tag[];

// One-to-One
@OneToOne(() => CompanySettings)
@JoinColumn()
settings: CompanySettings;
```

#### Exemplo Completo: Person Entity

```typescript
@Entity('person')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  @Column({ type: 'varchar', array: true, default: '{}' })
  tags: string[];

  @ManyToOne(() => Company, (company) => company.people, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ nullable: true })
  companyId: string;

  @OneToMany(() => Activity, (activity) => activity.person)
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Virtual/Computed fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName || ''}`.trim();
  }
}
```

### Repositories

#### Repository Básico

```typescript
@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  // Find all
  async findAll(): Promise<Person[]> {
    return this.personRepository.find();
  }

  // Find with filters
  async findByCompany(companyId: string): Promise<Person[]> {
    return this.personRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  // Find one
  async findOne(id: string): Promise<Person> {
    return this.personRepository.findOne({
      where: { id },
      relations: ['company', 'activities'],
    });
  }

  // Create
  async create(input: CreatePersonInput): Promise<Person> {
    const person = this.personRepository.create(input);
    return this.personRepository.save(person);
  }

  // Update
  async update(id: string, input: UpdatePersonInput): Promise<Person> {
    await this.personRepository.update(id, input);
    return this.findOne(id);
  }

  // Soft Delete
  async delete(id: string): Promise<void> {
    await this.personRepository.softDelete(id);
  }
}
```

#### Query Builder (Queries Complexas)

```typescript
async findPeopleWithCriteria(criteria: SearchCriteria): Promise<Person[]> {
  const query = this.personRepository
    .createQueryBuilder('person')
    .leftJoinAndSelect('person.company', 'company')
    .leftJoinAndSelect('person.activities', 'activity');

  // Filtros dinâmicos
  if (criteria.search) {
    query.where(
      'person.firstName ILIKE :search OR person.lastName ILIKE :search OR person.email ILIKE :search',
      { search: `%${criteria.search}%` },
    );
  }

  if (criteria.companyId) {
    query.andWhere('person.companyId = :companyId', {
      companyId: criteria.companyId,
    });
  }

  if (criteria.tags?.length) {
    query.andWhere('person.tags && :tags', { tags: criteria.tags });
  }

  // Ordenação
  query.orderBy('person.createdAt', 'DESC');

  // Paginação
  if (criteria.limit) {
    query.take(criteria.limit);
    query.skip((criteria.page - 1) * criteria.limit);
  }

  return query.getMany();
}
```

#### Raw Queries (Performance)

```typescript
async getCompanyStats(): Promise<CompanyStats[]> {
  return this.personRepository.query(`
    SELECT
      c.id,
      c.name,
      COUNT(p.id) as people_count,
      COUNT(o.id) as opportunities_count,
      SUM(o.amount) as total_revenue
    FROM company c
    LEFT JOIN person p ON p.company_id = c.id
    LEFT JOIN opportunity o ON o.company_id = c.id
    GROUP BY c.id, c.name
    ORDER BY total_revenue DESC
    LIMIT 10
  `);
}
```

### Migrations

#### Criar Migration

```bash
# Gerar automaticamente baseado nas mudanças nas entities
npx typeorm migration:generate src/database/typeorm/core/migrations/AddPhoneToPerson -d src/database/typeorm/core/core.datasource.ts

# Criar migration vazia
npx typeorm migration:create src/database/typeorm/core/migrations/AddIndexes
```

#### Exemplo de Migration

```typescript
export class AddPhoneToPerson1234567890 implements MigrationInterface {
  name = 'AddPhoneToPerson1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "person"
      ADD COLUMN "phone" varchar(20) NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_person_phone"
      ON "person" ("phone")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_person_phone"
    `);

    await queryRunner.query(`
      ALTER TABLE "person"
      DROP COLUMN "phone"
    `);
  }
}
```

#### Rodar Migrations

```bash
# Development
npx nx database:migrate:prod ninetwo-server

# Production
NODE_ENV=production npx typeorm migration:run -d dist/src/database/typeorm/core/core.datasource

# Reverter última migration
npx typeorm migration:revert -d src/database/typeorm/core/core.datasource.ts
```

### Transactions

```typescript
async transferOpportunity(
  opportunityId: string,
  newOwnerId: string,
): Promise<void> {
  await this.dataSource.transaction(async (manager) => {
    // Todas as operações dentro da transação
    const opportunity = await manager.findOne(Opportunity, {
      where: { id: opportunityId },
    });

    const oldOwnerId = opportunity.ownerId;

    // Update opportunity
    await manager.update(Opportunity, opportunityId, {
      ownerId: newOwnerId,
    });

    // Create activity log
    await manager.insert(Activity, {
      type: 'opportunity.transferred',
      opportunityId,
      metadata: { from: oldOwnerId, to: newOwnerId },
    });

    // Update stats
    await manager.query(
      `UPDATE user_stats SET opportunities = opportunities - 1 WHERE user_id = $1`,
      [oldOwnerId],
    );
    await manager.query(
      `UPDATE user_stats SET opportunities = opportunities + 1 WHERE user_id = $1`,
      [newOwnerId],
    );
  });
  // Se qualquer operação falhar, tudo é revertido
}
```

### Tarefas Práticas

- [ ] Crie uma nova entity do zero com relacionamentos
- [ ] Escreva queries complexas usando QueryBuilder
- [ ] Crie e execute uma migration
- [ ] Implemente uma operação com transaction
- [ ] Otimize uma query lenta usando índices

---

## 2.4 GraphQL API

### Schema GraphQL

No Ninetwo, o schema GraphQL é gerado automaticamente a partir das entities TypeORM e decorators.

#### Definindo Types com Code-First

```typescript
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Company {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  website?: string;

  @Field(() => Int, { defaultValue: 0 })
  employees: number;

  @Field(() => [Person])
  people: Person[];

  @Field()
  createdAt: Date;
}
```

#### Input Types

```typescript
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCompanyInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  website?: string;

  @Field(() => Int, { nullable: true })
  employees?: number;
}

@InputType()
export class UpdateCompanyInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  website?: string;

  @Field(() => Int, { nullable: true })
  employees?: number;
}
```

### Resolvers

#### Query Resolvers

```typescript
@Resolver(() => Company)
export class CompanyResolver {
  constructor(private companyService: CompanyService) {}

  @Query(() => [Company], { description: 'Get all companies' })
  @UseGuards(JwtAuthGuard)
  async companies(
    @CurrentWorkspace() workspace: Workspace,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<Company[]> {
    return this.companyService.findAll(workspace.id, { limit, offset });
  }

  @Query(() => Company, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async company(
    @Args('id', { type: () => ID }) id: string,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Company | null> {
    return this.companyService.findOne(id, workspace.id);
  }
}
```

#### Mutation Resolvers

```typescript
@Resolver(() => Company)
export class CompanyResolver {
  @Mutation(() => Company)
  @UseGuards(JwtAuthGuard)
  async createCompany(
    @Args('input') input: CreateCompanyInput,
    @CurrentWorkspace() workspace: Workspace,
    @CurrentUser() user: User,
  ): Promise<Company> {
    return this.companyService.create(input, workspace.id, user.id);
  }

  @Mutation(() => Company)
  @UseGuards(JwtAuthGuard)
  async updateCompany(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCompanyInput,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Company> {
    return this.companyService.update(id, input, workspace.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteCompany(
    @Args('id', { type: () => ID }) id: string,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    await this.companyService.delete(id, workspace.id);
    return true;
  }
}
```

#### Field Resolvers (Lazy Loading)

```typescript
@Resolver(() => Company)
export class CompanyResolver {
  constructor(
    private companyService: CompanyService,
    private personService: PersonService,
  ) {}

  // Resolve relacionamento people sob demanda
  @ResolveField(() => [Person])
  async people(@Parent() company: Company): Promise<Person[]> {
    return this.personService.findByCompanyId(company.id);
  }

  // Computed field
  @ResolveField(() => Int)
  async peopleCount(@Parent() company: Company): Promise<number> {
    return this.personService.countByCompanyId(company.id);
  }
}
```

### Custom Decorators

```typescript
// decorators/current-workspace.decorator.ts
export const CurrentWorkspace = createParamDecorator(
  (data: unknown, context: ExecutionContext): Workspace => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.workspace;
  },
);

// decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);

// Uso
@Query(() => [Company])
@UseGuards(JwtAuthGuard)
async myCompanies(
  @CurrentUser() user: User,
  @CurrentWorkspace() workspace: Workspace,
): Promise<Company[]> {
  return this.companyService.findByUser(user.id, workspace.id);
}
```

### Error Handling

```typescript
// Custom exceptions
export class CompanyNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Company with ID ${id} not found`);
  }
}

// No resolver
@Query(() => Company)
async company(@Args('id') id: string): Promise<Company> {
  const company = await this.companyService.findOne(id);

  if (!company) {
    throw new CompanyNotFoundException(id);
  }

  return company;
}

// Global exception filter
@Catch()
export class GraphQLErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Formata erros para GraphQL
    const gqlHost = GqlArgumentsHost.create(host);

    return new GraphQLError(exception.message, {
      extensions: {
        code: exception.status || 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### DataLoader (N+1 Problem)

```typescript
// Resolver companies para cada pessoa seria N+1
@ResolveField(() => Company)
async company(@Parent() person: Person): Promise<Company> {
  return this.companyService.findOne(person.companyId);
  // Isso faz 1 query por pessoa! 😱
}

// Solução: DataLoader
@Injectable()
export class CompanyLoader {
  constructor(private companyService: CompanyService) {}

  createLoader() {
    return new DataLoader<string, Company>(async (ids) => {
      const companies = await this.companyService.findByIds([...ids]);
      const companyMap = new Map(companies.map((c) => [c.id, c]));
      return ids.map((id) => companyMap.get(id));
    });
  }
}

// No resolver
@ResolveField(() => Company)
async company(
  @Parent() person: Person,
  @Context('companyLoader') loader: DataLoader<string, Company>,
): Promise<Company> {
  return loader.load(person.companyId);
  // Agora faz 1 query para todas as pessoas! 🎉
}
```

### Subscriptions (Real-time)

```typescript
@Resolver()
export class CompanyResolver {
  constructor(private pubSub: PubSub) {}

  @Subscription(() => Company, {
    filter: (payload, variables) => {
      // Apenas envia para workspace correto
      return payload.workspaceId === variables.workspaceId;
    },
  })
  companyCreated(@Args('workspaceId') workspaceId: string) {
    return this.pubSub.asyncIterator('company.created');
  }

  @Mutation(() => Company)
  async createCompany(@Args('input') input: CreateCompanyInput) {
    const company = await this.companyService.create(input);

    // Publish para subscribers
    this.pubSub.publish('company.created', {
      companyCreated: company,
      workspaceId: company.workspaceId,
    });

    return company;
  }
}
```

### Tarefas Práticas

- [ ] Explore o GraphQL Playground em `http://localhost:3000/graphql`
- [ ] Execute queries e mutations manualmente
- [ ] Adicione um novo field resolver
- [ ] Implemente um custom decorator
- [ ] Teste subscriptions em tempo real

---

## 2.5 Autenticação & Autorização

### Passport Strategies

#### JWT Strategy

```typescript
// strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;  // Será adicionado ao request.user
  }
}
```

#### OAuth2 Strategy (Google)

```typescript
// strategies/google-oauth.strategy.ts
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.get('BACKEND_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<User> {
    // Criar ou buscar usuário baseado no perfil do Google
    return this.authService.validateOAuthLogin(profile, 'google');
  }
}
```

### Guards

#### JWT Auth Guard

```typescript
// guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Para GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    return super.canActivate(new ExecutionContextHost([req]));
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

#### Workspace Guard

```typescript
// guards/workspace.guard.ts
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private workspaceService: WorkspaceService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const user = req.user;
    const workspaceId = req.headers['x-workspace-id'];

    if (!workspaceId) {
      throw new BadRequestException('Workspace ID required');
    }

    // Verificar se usuário tem acesso ao workspace
    const hasAccess = await this.workspaceService.userHasAccess(
      user.id,
      workspaceId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('No access to workspace');
    }

    // Adicionar workspace ao request
    req.workspace = await this.workspaceService.findOne(workspaceId);

    return true;
  }
}
```

### Auth Service

```typescript
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private bcrypt: BcryptService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);

    if (user && await this.bcrypt.compare(password, user.passwordHash)) {
      return user;
    }

    return null;
  }

  async login(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async register(input: RegisterInput): Promise<User> {
    // Verificar se email já existe
    const existing = await this.userService.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await this.bcrypt.hash(input.password);

    // Criar usuário
    const user = await this.userService.create({
      ...input,
      passwordHash,
    });

    return user;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException();
      }

      return {
        accessToken: this.jwtService.sign({
          sub: user.id,
          email: user.email,
        }, { expiresIn: '15m' }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### Auth Resolver

```typescript
@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthPayload> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.authService.login(user);

    return { user, ...tokens };
  }

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') input: RegisterInput,
  ): Promise<AuthPayload> {
    const user = await this.authService.register(input);
    const tokens = await this.authService.login(user);

    return { user, ...tokens };
  }

  @Mutation(() => RefreshTokenPayload)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    return this.authService.refreshToken(refreshToken);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
```

### Usando Guards nos Resolvers

```typescript
@Resolver(() => Company)
export class CompanyResolver {
  // Apenas autenticado
  @Query(() => [Company])
  @UseGuards(JwtAuthGuard)
  async companies(@CurrentUser() user: User): Promise<Company[]> {
    return this.companyService.findAll(user.workspaceId);
  }

  // Autenticado + workspace correto
  @Query(() => Company)
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async company(
    @Args('id') id: string,
    @CurrentWorkspace() workspace: Workspace,
  ): Promise<Company> {
    return this.companyService.findOne(id, workspace.id);
  }

  // Autenticado + role específica
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAllCompanies(): Promise<boolean> {
    await this.companyService.deleteAll();
    return true;
  }
}
```

### Tarefas Práticas

- [ ] Implemente registro e login no GraphQL Playground
- [ ] Teste fluxo de refresh token
- [ ] Adicione um guard customizado (ex: OwnershipGuard)
- [ ] Implemente OAuth2 com Google
- [ ] Teste autorização baseada em roles

---

## 🎯 Checklist de Conclusão da Fase 2

- [ ] Entende a estrutura modular do NestJS
- [ ] Sabe criar e modificar módulos
- [ ] Domina TypeORM (entities, repositories, migrations)
- [ ] Consegue criar APIs GraphQL completas
- [ ] Entende autenticação JWT e OAuth2
- [ ] Implementou pelo menos 1 módulo completo do zero

---

**Próxima Fase:** [Fase 3 - Frontend](./fase-3-frontend.md)

**Última atualização:** Outubro 2025

