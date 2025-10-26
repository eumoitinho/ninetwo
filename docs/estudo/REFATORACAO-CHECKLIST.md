# ✅ Checklist de Refatoração - Marketing Module

Use este checklist para refatorar o módulo Marketing passo a passo.

---

## 📋 Progresso Geral

```
[  ] Fase 1: Preparação (3 passos)
[  ] Fase 2: Criar Estrutura (4 passos)
[  ] Fase 3: Mover Arquivos (6 passos)
[  ] Fase 4: Atualizar Configurações (3 passos)
[  ] Fase 5: Validação (4 passos)
```

---

## 🎯 FASE 1: Preparação

### [ ] 1.1 - Criar Branch

```bash
git checkout -b refactor/marketing-module-structure
git status  # Verificar que está na branch correta
```

**Você está fazendo:** Isolando suas mudanças em uma branch dedicada.

---

### [ ] 1.2 - Backup Atual

```bash
# Criar backup da estrutura atual
cp -r packages/ninetwo-server/src/modules/marketing \
      packages/ninetwo-server/src/modules/marketing.backup

cp -r packages/ninetwo-server/src/modules/marketing-ads-manager \
      packages/ninetwo-server/src/modules/marketing-ads-manager.backup

# Você pode deletar depois se tudo funcionar
```

**Você está fazendo:** Criando backup de segurança.

---

### [ ] 1.3 - Mapear Dependências

```bash
# Listar todos os arquivos que importam marketing-ads-manager
grep -r "marketing-ads-manager" packages/ninetwo-server/src/ \
  --exclude-dir=node_modules \
  --exclude-dir=dist > /tmp/marketing-imports.txt

# Revisar arquivo
cat /tmp/marketing-imports.txt
```

**Você está fazendo:** Identificando todos os arquivos que precisarão ser atualizados.

---

## 🏗️ FASE 2: Criar Estrutura

### [ ] 2.1 - Criar marketing-accounts-manager/

```bash
cd packages/ninetwo-server/src/modules/marketing

# Criar diretórios
mkdir -p marketing-accounts-manager/services
mkdir -p marketing-accounts-manager/resolvers

# Criar arquivo do módulo
touch marketing-accounts-manager/marketing-accounts-manager.module.ts
```

**Você está fazendo:** Criando submódulo para gerenciar contas de Ads/Analytics.

**Conteúdo do módulo:**

```typescript
// marketing-accounts-manager/marketing-accounts-manager.module.ts
import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';

@Module({
  imports: [
    OAuth2ClientManagerModule,
    RefreshTokensManagerModule,
    NinetwoORMModule,
  ],
  providers: [
    // Services serão adicionados depois que movermos
  ],
  exports: [
    // Exports serão adicionados depois
  ],
})
export class MarketingAccountsManagerModule {}
```

---

### [ ] 2.2 - Criar marketing-apis-manager/

```bash
cd packages/ninetwo-server/src/modules/marketing

# Criar diretórios
mkdir -p marketing-apis-manager/services
mkdir -p marketing-apis-manager/resolvers

# Criar arquivo do módulo
touch marketing-apis-manager/marketing-apis-manager.module.ts
```

**Você está fazendo:** Criando submódulo para APIs gerais de marketing.

**Conteúdo do módulo:**

```typescript
// marketing-apis-manager/marketing-apis-manager.module.ts
import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';

@Module({
  imports: [
    MarketingCommonModule,
    NinetwoORMModule,
  ],
  providers: [
    // Services serão adicionados depois
  ],
  exports: [
    // Exports serão adicionados depois
  ],
})
export class MarketingApisManagerModule {}
```

---

### [ ] 2.3 - Mover marketing-ads-manager

```bash
cd packages/ninetwo-server/src/modules

# Mover para dentro de marketing/
mv marketing-ads-manager marketing/marketing-realtime-manager

# Verificar
ls -la marketing/marketing-realtime-manager/
```

**Você está fazendo:** Transformando módulo irmão em submódulo.

---

### [ ] 2.4 - Renomear marketing-realtime-manager.module.ts

```bash
cd packages/ninetwo-server/src/modules/marketing/marketing-realtime-manager

# Renomear arquivo
mv marketing-ads-manager.module.ts marketing-realtime-manager.module.ts
```

**Atualizar conteúdo do arquivo:**

```typescript
// Procurar e substituir no arquivo:
// Antes: export class MarketingAdsManagerModule
// Depois: export class MarketingRealtimeManagerModule
```

---

## 📦 FASE 3: Mover Arquivos

### [ ] 3.1 - Mover google-ads-account.service.ts

```bash
# Mover de connected-account para marketing
mv packages/ninetwo-server/src/modules/connected-account/services/google-ads-account.service.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-accounts-manager/services/
```

**Você está fazendo:** Movendo lógica de negócio de marketing para dentro do módulo marketing.

---

### [ ] 3.2 - Mover google-analytics-property.service.ts

```bash
mv packages/ninetwo-server/src/modules/connected-account/services/google-analytics-property.service.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-accounts-manager/services/
```

---

### [ ] 3.3 - Mover marketing-accounts.resolver.ts

```bash
mv packages/ninetwo-server/src/modules/connected-account/services/marketing-accounts.resolver.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-accounts-manager/resolvers/
```

---

### [ ] 3.4 - Mover marketing-apis.service.ts

```bash
mv packages/ninetwo-server/src/modules/marketing/services/marketing-apis.service.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-apis-manager/services/
```

---

### [ ] 3.5 - Mover marketing-channel.resolver.ts

```bash
mv packages/ninetwo-server/src/modules/marketing/resolvers/marketing-channel.resolver.ts \
   packages/ninetwo-server/src/modules/marketing/marketing-apis-manager/resolvers/
```

---

### [ ] 3.6 - Remover Pastas Vazias

```bash
# Remover se vazias
rmdir packages/ninetwo-server/src/modules/marketing/services 2>/dev/null
rmdir packages/ninetwo-server/src/modules/marketing/resolvers 2>/dev/null
```

---

## 🔧 FASE 4: Atualizar Configurações

### [ ] 4.1 - Atualizar marketing-accounts-manager.module.ts

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
    OAuth2ClientManagerModule,
    RefreshTokensManagerModule,
    NinetwoORMModule,
  ],
  providers: [
    GoogleAdsAccountService,
    GoogleAnalyticsPropertyService,
    MarketingAccountsResolver,
  ],
  exports: [
    GoogleAdsAccountService,
    GoogleAnalyticsPropertyService,
  ],
})
export class MarketingAccountsManagerModule {}
```

**Você está fazendo:** Configurando o novo submódulo com providers corretos.

---

### [ ] 4.2 - Atualizar marketing-apis-manager.module.ts

```typescript
// marketing/marketing-apis-manager/marketing-apis-manager.module.ts

import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';
import { MarketingImportManagerModule } from 'src/modules/marketing/marketing-import-manager/marketing-import-manager.module';
import { MarketingChannelResolver } from 'src/modules/marketing/marketing-apis-manager/resolvers/marketing-channel.resolver';
import { MarketingAPIsService } from 'src/modules/marketing/marketing-apis-manager/services/marketing-apis.service';

@Module({
  imports: [
    MarketingCommonModule,
    MarketingImportManagerModule,  // Precisa para messageQueueService
    NinetwoORMModule,
  ],
  providers: [
    MarketingAPIsService,
    MarketingChannelResolver,
  ],
  exports: [
    MarketingAPIsService,
  ],
})
export class MarketingApisManagerModule {}
```

---

### [ ] 4.3 - Atualizar marketing.module.ts (Raiz)

```typescript
// marketing/marketing.module.ts

import { Module } from '@nestjs/common';

import { MarketingAccountsManagerModule } from 'src/modules/marketing/marketing-accounts-manager/marketing-accounts-manager.module';
import { MarketingApisManagerModule } from 'src/modules/marketing/marketing-apis-manager/marketing-apis-manager.module';
import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';
import { MarketingImportManagerModule } from 'src/modules/marketing/marketing-import-manager/marketing-import-manager.module';
import { MarketingRealtimeManagerModule } from 'src/modules/marketing/marketing-realtime-manager/marketing-realtime-manager.module';

@Module({
  imports: [
    MarketingCommonModule,              // Entities
    MarketingAccountsManagerModule,     // Gerenciamento de contas
    MarketingApisManagerModule,         // APIs gerais
    MarketingImportManagerModule,       // Background sync
    MarketingRealtimeManagerModule,     // Operações real-time
  ],
  providers: [],  // ✅ VAZIO
  exports: [],    // ✅ VAZIO
})
export class MarketingModule {}
```

**Você está fazendo:** Transformando marketing.module.ts em agregador puro (como Calendar).

---

## 🔄 FASE 5: Atualizar Imports

### [ ] 5.1 - Atualizar modules.module.ts

```typescript
// modules/modules.module.ts

// REMOVER:
import { MarketingAdsManagerModule } from 'src/modules/marketing-ads-manager/marketing-ads-manager.module';

// Em imports do @Module, REMOVER:
@Module({
  imports: [
    // MarketingAdsManagerModule,  ← DELETAR esta linha
    // ... outros imports
  ],
})
```

**Você está fazendo:** Removendo módulo irmão (agora é submódulo).

---

### [ ] 5.2 - Atualizar Imports nos Services Movidos

**Arquivos para atualizar:**

```bash
# 1. google-ads-account.service.ts
# 2. google-analytics-property.service.ts
# 3. marketing-accounts.resolver.ts
# 4. marketing-apis.service.ts
# 5. marketing-channel.resolver.ts
```

**Substituições necessárias:**

```typescript
// Se algum arquivo tiver imports relativos, atualizar

// Exemplo: marketing-accounts.resolver.ts
// Antes (se tiver):
import { GoogleAdsAccountService } from '../services/google-ads-account.service';

// Depois:
import { GoogleAdsAccountService } from 'src/modules/marketing/marketing-accounts-manager/services/google-ads-account.service';
```

**Comando para verificar:**

```bash
# Ver se há imports relativos quebrados
cd packages/ninetwo-server/src/modules/marketing
grep -r "from '\\.\\." marketing-accounts-manager/
grep -r "from '\\.\\." marketing-apis-manager/
```

---

### [ ] 5.3 - Atualizar marketing-realtime-manager.module.ts

```typescript
// marketing/marketing-realtime-manager/marketing-realtime-manager.module.ts

// ANTES:
export class MarketingAdsManagerModule {}

// DEPOIS:
export class MarketingRealtimeManagerModule {}

// Atualizar todos os imports internos também
```

**Ferramenta:**

```bash
# Buscar e substituir em TODOS os arquivos do submódulo
cd packages/ninetwo-server/src/modules/marketing/marketing-realtime-manager
find . -type f -name "*.ts" -exec sed -i 's/MarketingAdsManagerModule/MarketingRealtimeManagerModule/g' {} +
```

---

### [ ] 5.4 - Buscar e Atualizar Imports em Todo Projeto

```bash
# Buscar imports de connected-account/services/google-ads-account
grep -r "connected-account/services/google-ads-account" \
  packages/ninetwo-server/src/ \
  --include="*.ts"

# Se encontrar, atualizar para:
# marketing/marketing-accounts-manager/services/google-ads-account
```

**Arquivos que provavelmente precisam atualização:**
- `marketing/marketing.module.ts` ✅ (já fizemos)
- Qualquer outro módulo que use esses services

---

## ✅ FASE 6: Validação

### [ ] 6.1 - Type Check

```bash
npx nx typecheck ninetwo-server
```

**Se houver erros:**
- Leia a mensagem de erro
- Identifique import quebrado
- Corrija o caminho

**Erros comuns:**

```
❌ Cannot find module 'src/modules/marketing-ads-manager/...'
✅ Atualizar para: 'src/modules/marketing/marketing-realtime-manager/...'

❌ Cannot find module '../services/google-ads-account.service'
✅ Atualizar para: 'src/modules/marketing/marketing-accounts-manager/services/...'
```

---

### [ ] 6.2 - Lint

```bash
npx nx lint ninetwo-server --fix
```

**Você está fazendo:** Corrigindo problemas de formatação e imports não usados.

---

### [ ] 6.3 - Build

```bash
npx nx build ninetwo-server
```

**Se build passar:**
- ✅ Estrutura está correta
- ✅ Todos os imports estão corretos

**Se build falhar:**
- ❌ Há imports quebrados
- Volte e corrija

---

### [ ] 6.4 - Testar Aplicação

```bash
# Iniciar servidor
npx nx start ninetwo-server

# Em outro terminal, verificar logs
# Se iniciar sem erros: ✅

# Testar GraphQL
# http://localhost:3000/graphql
```

**Testar queries:**

```graphql
# 1. Testar contas
query {
  getMarketingAdAccounts(connectedAccountId: "xxx") {
    accounts {
      id
      name
    }
  }
}

# 2. Testar campanhas
query {
  getMarketingCampaigns(
    connectedAccountId: "xxx"
    customerId: "123"
  ) {
    id
    name
    status
  }
}

# 3. Testar channel
query {
  getMarketingChannel(marketingChannelId: "xxx")
}
```

---

## 🧹 FASE 7: Limpeza

### [ ] 7.1 - Remover Backups

```bash
# Se tudo funcionou, remover backups
rm -rf packages/ninetwo-server/src/modules/marketing.backup
rm -rf packages/ninetwo-server/src/modules/marketing-ads-manager.backup
```

---

### [ ] 7.2 - Commit

```bash
git add .
git commit -m "refactor(marketing): reorganize module structure to follow Calendar pattern

- Move marketing-ads-manager to marketing/marketing-realtime-manager
- Create marketing-accounts-manager submódulo
- Create marketing-apis-manager submódulo
- Move services from connected-account to marketing
- Clean up marketing.module.ts (empty providers/exports)
- Update all imports

Follows same pattern as Calendar and Messaging modules."
```

---

### [ ] 7.3 - Atualizar Frontend (se necessário)

```bash
# Regenerar tipos GraphQL
npx nx graphql:generate ninetwo-front
```

**Você está fazendo:** Atualizando tipos TypeScript do frontend com mudanças do backend.

---

## 📊 Diagrama Visual da Mudança

### ANTES

```
modules/
├── connected-account/
│   ├── oauth2-client-manager/ ✅
│   └── services/
│       ├── google-ads-account.service.ts ❌
│       └── marketing-accounts.resolver.ts ❌
│
├── marketing/
│   ├── marketing.module.ts
│   │   providers: [5 items] ❌
│   ├── services/
│   │   └── marketing-apis.service.ts ❌
│   └── resolvers/
│       └── marketing-channel.resolver.ts ❌
│
└── marketing-ads-manager/ ❌ (separado)
```

### DEPOIS

```
modules/
├── connected-account/
│   └── oauth2-client-manager/ ✅ (apenas OAuth2)
│
└── marketing/
    ├── marketing.module.ts
    │   providers: [] ✅ VAZIO
    │
    ├── common/ ✅
    │
    ├── marketing-accounts-manager/ ✅ NOVO
    │   ├── services/
    │   │   ├── google-ads-account.service.ts
    │   │   └── google-analytics-property.service.ts
    │   └── resolvers/
    │       └── marketing-accounts.resolver.ts
    │
    ├── marketing-apis-manager/ ✅ NOVO
    │   ├── services/
    │   │   └── marketing-apis.service.ts
    │   └── resolvers/
    │       └── marketing-channel.resolver.ts
    │
    ├── marketing-import-manager/ ✅
    │
    └── marketing-realtime-manager/ ✅ (renomeado)
```

---

## 🎓 O Que Você Aprendeu

### 1. **ConnectedAccount é Infraestrutura**
- Gerencia OAuth2
- Armazena tokens
- **NÃO** tem lógica de negócio

### 2. **Modules Devem Ser Agregadores**
- Imports de submódulos
- Providers vazio
- Exports vazio (ou mínimo)

### 3. **Lógica em Submódulos**
- Cada submódulo = uma responsabilidade
- Encapsulamento de dependências
- Fácil manutenção

### 4. **Padrão Consistente**
- Calendar = template
- Messaging = template
- Marketing = agora também template!

---

## ⚠️ Problemas Comuns

### Erro: Cannot find module

```
Error: Cannot find module 'src/modules/marketing-ads-manager/...'
```

**Solução:**
```bash
# Buscar todos os imports
grep -r "marketing-ads-manager" packages/ninetwo-server/src/

# Substituir por:
# marketing/marketing-realtime-manager
```

---

### Erro: Circular dependency

```
Warning: Circular dependency detected
```

**Solução:**
- Verificar se submódulos não importam uns aos outros diretamente
- Usar exports corretos
- Importar apenas o necessário

---

### Erro: GraphQL schema not updated

```
Error: Type 'MarketingCampaign' not found
```

**Solução:**
```bash
# Regenerar tipos
npx nx graphql:generate ninetwo-front
```

---

## 🎯 Checklist Final

Após completar TODAS as fases acima:

- [ ] TypeScript compila sem erros
- [ ] Servidor inicia sem erros
- [ ] GraphQL Playground funciona
- [ ] Queries de marketing funcionam
- [ ] Frontend compila e roda
- [ ] Nenhum import quebrado
- [ ] Estrutura segue padrão Calendar
- [ ] Commit feito com mensagem descritiva

---

## 📚 Próximos Passos Após Refatoração

1. [ ] Criar testes para os novos submódulos
2. [ ] Atualizar documentação
3. [ ] Code review com equipe
4. [ ] Merge para main
5. [ ] Deploy

---

**Tempo estimado:** 2-4 horas
**Dificuldade:** Média
**Risco:** Baixo (se seguir checklist)

---

**Última atualização:** Outubro 2025

