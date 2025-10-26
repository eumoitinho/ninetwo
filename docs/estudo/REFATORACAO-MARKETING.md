# 🔧 Refatoração do Marketing - Guia Passo a Passo

Este documento guia a refatoração do módulo Marketing para seguir o padrão correto (Calendar/Messaging).

---

## 🎯 Objetivo da Refatoração

**De:** Dois módulos separados com lógica desorganizada
**Para:** Um módulo unificado seguindo o padrão Calendar

---

## 📊 Entendendo o ConnectedAccount

### O que é ConnectedAccount?

**ConnectedAccount** é um módulo **COMPARTILHADO** que gerencia **todas as conexões OAuth2** do sistema:

```
ConnectedAccount (Central Hub)
    ├─ MessageChannel (Gmail, Outlook)
    ├─ CalendarChannel (Google Calendar, Outlook Calendar)
    └─ MarketingChannel (Google Ads, Google Analytics, Meta Ads)
```

### Estrutura do ConnectedAccount

```
connected-account/
├── connected-account.module.ts          ← Módulo raiz
│
├── standard-objects/
│   └── connected-account.workspace-entity.ts  ← Entity principal
│       ├─ handle (email/username)
│       ├─ provider (google, microsoft, google-ads, google-analytics, meta-ads)
│       ├─ accessToken (OAuth2)
│       ├─ refreshToken (OAuth2)
│       ├─ scopes (permissões)
│       ├─ syncConfig (configurações JSON)
│       └─ Relações:
│           ├─ messageChannels[]
│           ├─ calendarChannels[]
│           └─ marketingChannels[]
│
├── oauth2-client-manager/               ← Gerencia OAuth2
│   ├── services/
│   │   └── oauth2-client-manager.service.ts  ← Service principal
│   └── drivers/
│       ├── google/                      ← Gmail, Calendar
│       ├── google-ads/                  ← Google Ads específico
│       ├── google-analytics/            ← GA4 específico
│       ├── meta-ads/                    ← Facebook/Meta Ads
│       └── microsoft/                   ← Outlook
│
├── refresh-tokens-manager/              ← Refresh automático
│   └── services/
│       └── connected-account-refresh-tokens.service.ts
│
└── services/                            ⚠️ PROBLEMA AQUI
    ├── google-ads-account.service.ts         ← De marketing!
    ├── google-analytics-property.service.ts  ← De marketing!
    └── marketing-accounts.resolver.ts        ← De marketing!
```

---

## 🔍 Como Calendar/Messaging Usam ConnectedAccount

### Calendar

```
User conecta Google Calendar
    ↓
1. ConnectedAccount criada
   ├─ provider: "google"
   ├─ handle: "user@gmail.com"
   ├─ accessToken: "ya29.xxx"
   └─ refreshToken: "1//xxx"
    ↓
2. Event: "connectedAccount.created"
    ↓
3. ConnectedAccountListener cria CalendarChannel
   ├─ connectedAccountId: <id>
   ├─ syncStatus: NOT_SYNCED
   └─ syncStage: PENDING_CONFIGURATION
    ↓
4. User configura no frontend
    ↓
5. Frontend chama startChannelSync mutation
    ↓
6. CalendarChannel.syncStage: CALENDAR_EVENT_LIST_FETCH_PENDING
    ↓
7. Cron job pega e inicia sincronização
```

**Responsabilidades:**
- `ConnectedAccount`: OAuth2, tokens, autenticação
- `CalendarChannel`: Sincronização, dados de calendário

---

## 🎯 Estado Atual do Marketing (PROBLEMA)

### Problema 1: Services de Marketing em ConnectedAccount

```
connected-account/services/
├── google-ads-account.service.ts        ❌ Deveria estar em marketing!
├── google-analytics-property.service.ts ❌ Deveria estar em marketing!
└── marketing-accounts.resolver.ts       ❌ Deveria estar em marketing!
```

**Por que é problema?**
- ConnectedAccount deveria ser **agnóstico** ao domínio
- Lógica de negócio de marketing não pertence aqui
- Quebra encapsulamento

### Problema 2: Marketing.module.ts com Lógica

```typescript
// marketing.module.ts (ATUAL)
@Module({
  providers: [
    GoogleAdsAccountService,        ❌ De connected-account
    GoogleAnalyticsPropertyService, ❌ De connected-account
    MarketingAccountsResolver,      ❌ De connected-account
    MarketingAPIsService,           ❌ Deveria estar em submódulo
    MarketingChannelResolver,       ❌ Deveria estar em submódulo
  ],
})
```

### Problema 3: Marketing Ads Manager Separado

```
modules/
├── marketing/              ← Módulo 1
└── marketing-ads-manager/  ← Módulo 2 ❌ Deveria ser submódulo
```

---

## 🏗️ Arquitetura Alvo (SOLUÇÃO)

### Estrutura Final

```
modules/
└── marketing/
    ├── marketing.module.ts                    ← Apenas agregador
    │   @Module({
    │     imports: [
    │       MarketingCommonModule,
    │       MarketingAccountsManagerModule,    ← NOVO
    │       MarketingImportManagerModule,
    │       MarketingRealtimeManagerModule,    ← marketing-ads-manager renomeado
    │     ],
    │     providers: [],  ← VAZIO
    │     exports: [],    ← VAZIO
    │   })
    │
    ├── common/                                ← Entities compartilhadas
    │   ├── marketing-common.module.ts
    │   └── standard-objects/
    │       ├── marketing-channel.workspace-entity.ts
    │       ├── ads-campaign.workspace-entity.ts
    │       ├── analytics-data.workspace-entity.ts
    │       └── marketing-dashboard.workspace-entity.ts
    │
    ├── marketing-accounts-manager/            ← NOVO submódulo
    │   ├── marketing-accounts-manager.module.ts
    │   ├── resolvers/
    │   │   └── marketing-accounts.resolver.ts    ← Move de connected-account
    │   └── services/
    │       ├── google-ads-account.service.ts     ← Move de connected-account
    │       └── google-analytics-property.service.ts ← Move de connected-account
    │
    ├── marketing-import-manager/              ← JÁ EXISTE
    │   └── ... (background sync)
    │
    ├── marketing-realtime-manager/            ← Renomeia marketing-ads-manager
    │   └── ... (operações em tempo real)
    │
    └── marketing-apis-manager/                ← NOVO submódulo
        ├── marketing-apis-manager.module.ts
        ├── resolvers/
        │   └── marketing-channel.resolver.ts     ← Move de marketing/resolvers
        └── services/
            └── marketing-apis.service.ts         ← Move de marketing/services
```

---

## 📋 Plano de Refatoração (12 Passos)

### FASE 1: Preparação (Entendimento)

#### ✅ Passo 1: Entender ConnectedAccount

**O que você está fazendo:**
Entendendo como ConnectedAccount funciona e por que é compartilhado.

**ConnectedAccount é:**
- ✅ Módulo de **infraestrutura**
- ✅ Gerencia OAuth2 para **todos os providers**
- ✅ Armazena tokens (access + refresh)
- ✅ **Não** tem lógica de negócio específica

**Exemplo de uso correto (Calendar):**

```typescript
// Calendar NÃO tem services em ConnectedAccount
// Calendar SÓ USA os drivers OAuth2

// calendar-event-import-manager.module.ts
@Module({
  imports: [
    OAuth2ClientManagerModule,  // ← USA apenas o gerenciador OAuth2
  ],
  providers: [
    CalendarFetchEventsService,  // ← Lógica de calendar AQUI
  ],
})
```

**Exemplo de uso incorreto (Marketing atual):**

```typescript
// ❌ Marketing tem services EM connected-account
// connected-account/services/google-ads-account.service.ts
// ↑ Isso é lógica de NEGÓCIO de marketing, não infraestrutura!
```

---

#### ✅ Passo 2: Mapear Dependências

**O que você está fazendo:**
Identificando tudo que precisa ser movido.

**Criar arquivo:** `docs/estudo/REFATORACAO-MAPEAMENTO.md`

```markdown
# Services para mover de connected-account para marketing:

1. google-ads-account.service.ts
   - Onde está: connected-account/services/
   - Para onde: marketing/marketing-accounts-manager/services/
   - Usado por: MarketingAccountsResolver

2. google-analytics-property.service.ts
   - Onde está: connected-account/services/
   - Para onde: marketing/marketing-accounts-manager/services/
   - Usado por: MarketingAccountsResolver

3. marketing-accounts.resolver.ts
   - Onde está: connected-account/services/
   - Para onde: marketing/marketing-accounts-manager/resolvers/
   - Expõe: getMarketingAdAccounts, getMarketingAnalyticsAccounts

# Services para mover de marketing raiz para submódulo:

4. marketing-apis.service.ts
   - Onde está: marketing/services/
   - Para onde: marketing/marketing-apis-manager/services/
   - Usado por: MarketingChannelResolver

5. marketing-channel.resolver.ts
   - Onde está: marketing/resolvers/
   - Para onde: marketing/marketing-apis-manager/resolvers/
   - Expõe: updateMarketingChannelAccountConfig, getMarketingChannel

# Módulo para mover:

6. marketing-ads-manager/
   - Onde está: modules/marketing-ads-manager/
   - Para onde: modules/marketing/marketing-realtime-manager/
   - Renomear: MarketingAdsManagerModule → MarketingRealtimeManagerModule
```

---

### FASE 2: Criar Novos Submódulos

#### ✅ Passo 3: Criar marketing-accounts-manager/

**O que você está fazendo:**
Criando submódulo para gerenciar contas de marketing (Ads, Analytics).

**Criar estrutura:**

```bash
mkdir -p packages/ninetwo-server/src/modules/marketing/marketing-accounts-manager/services
mkdir -p packages/ninetwo-server/src/modules/marketing/marketing-accounts-manager/resolvers
```

**Criar módulo:**

```typescript
// marketing/marketing-accounts-manager/marketing-accounts-manager.module.ts
import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';
import { MarketingAccountsResolver } from 'src/modules/marketing/marketing-accounts-manager/resolvers/marketing-accounts.resolver';
import { GoogleAdsAccountService } from 'src/modules/marketing/marketing-accounts-manager/services/google-ads-account.service';
import { GoogleAnalyticsPropertyService } from 'src/modules/marketing/marketing-accounts-manager/services/google-analytics-property.service';

@Module({
  imports: [
    OAuth2ClientManagerModule,     // ← Dependência OAuth2 AQUI
    RefreshTokensManagerModule,
    NinetwoORMModule,
  ],
  providers: [
    GoogleAdsAccountService,       // ← Services de marketing AQUI
    GoogleAnalyticsPropertyService,
    MarketingAccountsResolver,     // ← Resolver de marketing AQUI
  ],
  exports: [
    GoogleAdsAccountService,       // ← Exporta para outros submódulos
    GoogleAnalyticsPropertyService,
  ],
})
export class MarketingAccountsManagerModule {}
```

**Por que isso?**
- ✅ Encapsula lógica de **gerenciamento de contas** de marketing
- ✅ Isola dependências OAuth2
- ✅ Exporta services para outros submódulos de marketing
- ✅ Segue padrão Calendar

---

#### ✅ Passo 4: Criar marketing-apis-manager/

**O que você está fazendo:**
Criando submódulo para APIs gerais de marketing (não real-time).

```bash
mkdir -p packages/ninetwo-server/src/modules/marketing/marketing-apis-manager/services
mkdir -p packages/ninetwo-server/src/modules/marketing/marketing-apis-manager/resolvers
```

```typescript
// marketing/marketing-apis-manager/marketing-apis-manager.module.ts
import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';
import { MarketingChannelResolver } from 'src/modules/marketing/marketing-apis-manager/resolvers/marketing-channel.resolver';
import { MarketingAPIsService } from 'src/modules/marketing/marketing-apis-manager/services/marketing-apis.service';

@Module({
  imports: [
    MarketingCommonModule,
    NinetwoORMModule,
  ],
  providers: [
    MarketingAPIsService,
    MarketingChannelResolver,
  ],
  exports: [MarketingAPIsService],
})
export class MarketingApisManagerModule {}
```

**Por que isso?**
- ✅ Encapsula APIs gerais de marketing
- ✅ Separa de operações real-time
- ✅ Mantém organização clara

---

### FASE 3: Mover Arquivos

#### ✅ Passo 5: Mover Services de connected-account → marketing

**O que você está fazendo:**
Movendo lógica de negócio de marketing para dentro do módulo marketing.

```bash
# Move google-ads-account.service.ts
mv packages/ninetwo-server/src/modules/connected-account/services/google-ads-account.service.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-accounts-manager/services/

# Move google-analytics-property.service.ts
mv packages/ninetwo-server/src/modules/connected-account/services/google-analytics-property.service.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-accounts-manager/services/

# Move marketing-accounts.resolver.ts
mv packages/ninetwo-server/src/modules/connected-account/services/marketing-accounts.resolver.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-accounts-manager/resolvers/
```

**Atualizar imports nos arquivos movidos:**

```typescript
// Antes (nos arquivos movidos)
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';

// Depois (mesmo import, só mudou localização do arquivo)
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
// ✅ Import não muda! Só a localização do arquivo
```

---

#### ✅ Passo 6: Mover Services do marketing raiz → submódulo

```bash
# Criar diretórios se não existem
mkdir -p packages/ninetwo-server/src/modules/marketing/marketing-apis-manager/services
mkdir -p packages/ninetwo-server/src/modules/marketing/marketing-apis-manager/resolvers

# Mover marketing-apis.service.ts
mv packages/ninetwo-server/src/modules/marketing/services/marketing-apis.service.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-apis-manager/services/

# Mover marketing-channel.resolver.ts
mv packages/ninetwo-server/src/modules/marketing/resolvers/marketing-channel.resolver.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-apis-manager/resolvers/

# Remover pastas vazias
rmdir packages/ninetwo-server/src/modules/marketing/services
rmdir packages/ninetwo-server/src/modules/marketing/resolvers
```

---

#### ✅ Passo 7: Mover marketing-ads-manager → submódulo

**O que você está fazendo:**
Movendo marketing-ads-manager para DENTRO de marketing/.

```bash
# Mover o módulo inteiro
mv packages/ninetwo-server/src/modules/marketing-ads-manager \
   packages/ninetwo-server/src/modules/marketing/marketing-realtime-manager

# Renomear arquivo principal
mv packages/ninetwo-server/src/modules/marketing/marketing-realtime-manager/marketing-ads-manager.module.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-realtime-manager/marketing-realtime-manager.module.ts
```

**Atualizar nome do módulo:**

```typescript
// marketing-realtime-manager.module.ts
// Antes:
export class MarketingAdsManagerModule {}

// Depois:
export class MarketingRealtimeManagerModule {}
```

---

### FASE 4: Atualizar Imports

#### ✅ Passo 8: Atualizar marketing.module.ts

**O que você está fazendo:**
Transformando marketing.module.ts em um **agregador puro** (como Calendar).

```typescript
// packages/ninetwo-server/src/modules/marketing/marketing.module.ts

import { Module } from '@nestjs/common';

import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';
import { MarketingAccountsManagerModule } from 'src/modules/marketing/marketing-accounts-manager/marketing-accounts-manager.module';
import { MarketingApisManagerModule } from 'src/modules/marketing/marketing-apis-manager/marketing-apis-manager.module';
import { MarketingImportManagerModule } from 'src/modules/marketing/marketing-import-manager/marketing-import-manager.module';
import { MarketingRealtimeManagerModule } from 'src/modules/marketing/marketing-realtime-manager/marketing-realtime-manager.module';

@Module({
  imports: [
    MarketingCommonModule,              // Entities compartilhadas
    MarketingAccountsManagerModule,     // Gerenciamento de contas
    MarketingApisManagerModule,         // APIs gerais
    MarketingImportManagerModule,       // Background sync
    MarketingRealtimeManagerModule,     // Operações em tempo real
  ],
  providers: [],  // ✅ VAZIO - lógica nos submódulos
  exports: [],    // ✅ VAZIO - submódulos exportam o que precisam
})
export class MarketingModule {}
```

**Por que isso?**
- ✅ **Módulo raiz limpo** (como Calendar)
- ✅ **Responsabilidades claras** em submódulos
- ✅ **Fácil manutenção** e navegação
- ✅ **Consistente** com resto do projeto

---

#### ✅ Passo 9: Atualizar modules.module.ts

**O que você está fazendo:**
Removendo MarketingAdsManagerModule do nível raiz.

```typescript
// packages/ninetwo-server/src/modules/modules.module.ts

// ANTES:
@Module({
  imports: [
    MarketingAdsManagerModule,  // ❌ Remove isso
    // ...
  ],
})

// DEPOIS:
@Module({
  imports: [
    // MarketingAdsManagerModule,  ← REMOVIDO
    // Agora está dentro do MarketingModule como submódulo
    // ...
  ],
})
```

**Por que isso?**
- ✅ MarketingAdsManager agora é **submódulo** de Marketing
- ✅ Apenas MarketingModule é importado no raiz
- ✅ Hierarquia correta

---

#### ✅ Passo 10: Atualizar Imports nos Arquivos

**O que você está fazendo:**
Corrigindo imports quebrados após mover arquivos.

**Exemplo 1:** Arquivos que importavam de `connected-account/services/`

```typescript
// Qualquer arquivo que tenha:
import { GoogleAdsAccountService } from 'src/modules/connected-account/services/google-ads-account.service';

// Atualizar para:
import { GoogleAdsAccountService } from 'src/modules/marketing/marketing-accounts-manager/services/google-ads-account.service';
```

**Exemplo 2:** Arquivos que importavam `MarketingAdsManagerModule`

```typescript
// Antes:
import { MarketingAdsManagerModule } from 'src/modules/marketing-ads-manager/marketing-ads-manager.module';

// Depois:
import { MarketingRealtimeManagerModule } from 'src/modules/marketing/marketing-realtime-manager/marketing-realtime-manager.module';
```

**Ferramenta útil:**

```bash
# Buscar todos os imports do que foi movido
grep -r "connected-account/services/google-ads" packages/ninetwo-server/src/

# Buscar imports de marketing-ads-manager
grep -r "marketing-ads-manager" packages/ninetwo-server/src/
```

---

### FASE 5: Validação

#### ✅ Passo 11: Verificar Compilação

```bash
# Type check
npx nx typecheck ninetwo-server

# Build
npx nx build ninetwo-server

# Se houver erros de import, corrigir
```

#### ✅ Passo 12: Testar Funcionalidades

```bash
# Iniciar servidor
npx nx start ninetwo-server

# Verificar GraphQL Playground
# http://localhost:3000/graphql

# Testar queries de marketing:
query {
  getMarketingAdAccounts(connectedAccountId: "xxx") {
    accounts {
      id
      name
    }
  }
}
```

---

## 🎓 O Que Você Está Fazendo (Resumo)

### 1. **Separando Infraestrutura de Negócio**

```
ANTES:
ConnectedAccount (infraestrutura)
    ├─ OAuth2 ✅
    └─ Lógica de Marketing ❌  (ERRADO!)

DEPOIS:
ConnectedAccount (infraestrutura)
    └─ OAuth2 ✅

Marketing (negócio)
    └─ Usa OAuth2 via imports ✅
    └─ Lógica própria em submódulos ✅
```

### 2. **Organizando por Responsabilidade**

```
ANTES:
marketing/
├── Lógica no raiz ❌
└── marketing-ads-manager separado ❌

DEPOIS:
marketing/
├── marketing.module.ts (agregador) ✅
├── common/ (entities) ✅
├── marketing-accounts-manager/ (contas) ✅
├── marketing-apis-manager/ (APIs gerais) ✅
├── marketing-import-manager/ (sync) ✅
└── marketing-realtime-manager/ (real-time ops) ✅
```

### 3. **Seguindo o Padrão Calendar**

```
Antes:                    Depois:
Calendar ✅               Calendar ✅
Messaging ✅              Messaging ✅
Marketing ⚠️ (60%)        Marketing ✅ (100%)
```

---

## 📊 Diagrama Antes vs Depois

### ANTES (Problemático)

```
modules/
├── connected-account/
│   ├── oauth2-client-manager/          ✅ Infraestrutura
│   └── services/
│       ├── google-ads-account.service.ts      ❌ Lógica de marketing!
│       ├── google-analytics-property.service.ts ❌ Lógica de marketing!
│       └── marketing-accounts.resolver.ts     ❌ Lógica de marketing!
│
├── marketing/
│   ├── marketing.module.ts
│   │   providers: [5 items]  ❌ Lógica no raiz
│   ├── services/
│   │   └── marketing-apis.service.ts          ❌ Solto no raiz
│   └── resolvers/
│       └── marketing-channel.resolver.ts      ❌ Solto no raiz
│
└── marketing-ads-manager/                     ❌ Separado do marketing/
    └── ...
```

### DEPOIS (Correto)

```
modules/
├── connected-account/
│   └── oauth2-client-manager/          ✅ Apenas infraestrutura OAuth2
│
└── marketing/
    ├── marketing.module.ts
    │   @Module({
    │     imports: [Submódulos],
    │     providers: [],  ✅ VAZIO
    │   })
    │
    ├── common/                          ✅ Entities
    │
    ├── marketing-accounts-manager/      ✅ NOVO - Gerencia contas
    │   ├── resolvers/
    │   │   └── marketing-accounts.resolver.ts
    │   └── services/
    │       ├── google-ads-account.service.ts
    │       └── google-analytics-property.service.ts
    │
    ├── marketing-apis-manager/          ✅ NOVO - APIs gerais
    │   ├── resolvers/
    │   │   └── marketing-channel.resolver.ts
    │   └── services/
    │       └── marketing-apis.service.ts
    │
    ├── marketing-import-manager/        ✅ Background sync
    │
    └── marketing-realtime-manager/      ✅ Real-time ops
        └── ... (ex marketing-ads-manager)
```

---

## 🎯 Benefícios da Refatoração

### 1. **Consistência**
```
Calendar, Messaging, Marketing → Todos seguem mesmo padrão
```

### 2. **Manutenibilidade**
```
Desenvolvedor novo:
  "Como adiciono feature em Marketing?"
  → Olha Calendar
  → Replica padrão
  → Funciona! ✅
```

### 3. **Encapsulamento**
```
ConnectedAccount:
  - Não sabe sobre Marketing
  - Apenas provê OAuth2

Marketing:
  - Sabe sobre OAuth2
  - Gerencia própria lógica
```

### 4. **Testabilidade**
```
Testar MarketingAccountsManager:
  - Mock apenas OAuth2ClientManager
  - Não precisa de todo ConnectedAccount
```

---

## 🚀 Começando a Refatoração

### Checklist Inicial

- [ ] Li e entendi este documento
- [ ] Entendi o que é ConnectedAccount
- [ ] Entendi o padrão Calendar
- [ ] Mapeei todas as dependências
- [ ] Criei branch de refatoração: `git checkout -b refactor/marketing-module-structure`

### Primeiro Comando

```bash
# Criar branch
git checkout -b refactor/marketing-module-structure

# Criar estrutura de diretórios
mkdir -p packages/ninetwo-server/src/modules/marketing/marketing-accounts-manager/{services,resolvers}
mkdir -p packages/ninetwo-server/src/modules/marketing/marketing-apis-manager/{services,resolvers}
```

---

## 📝 Próximos Passos

Vou te guiar passo a passo. Me diga:

1. ✅ Você entendeu o que é ConnectedAccount?
2. ✅ Você entendeu por que precisamos mover os services?
3. ✅ Você está pronto para começar?

**Quando estiver pronto, te ajudo a:**
- Criar os novos submódulos
- Mover os arquivos
- Atualizar imports
- Testar tudo

---

**Última atualização:** Outubro 2025

