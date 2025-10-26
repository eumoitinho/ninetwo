# 🔌 ConnectedAccount - Módulo de Infraestrutura OAuth2

Este documento explica o módulo ConnectedAccount e como ele é usado por Calendar, Messaging e Marketing.

---

## 🎯 O Que É ConnectedAccount?

**ConnectedAccount** é o **módulo central de autenticação externa** do Ninetwo.

### Responsabilidade

```
┌─────────────────────────────────────────────────┐
│          ConnectedAccount                       │
│  (Infraestrutura de OAuth2 Compartilhada)      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ✅ Gerenciar OAuth2 (Google, Microsoft, Meta) │
│  ✅ Armazenar tokens (access + refresh)        │
│  ✅ Refresh automático de tokens               │
│  ✅ Drivers OAuth2 específicos                 │
│                                                 │
│  ❌ NÃO tem lógica de negócio                  │
│  ❌ NÃO sabe sobre Calendar/Messaging/Marketing│
│  ❌ NÃO sincroniza dados                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitetura do ConnectedAccount

```
┌─────────────────────────────────────────────────────────────┐
│              ConnectedAccount Module                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Entity (Database)                         │
├──────────────────────────────────────────────────────────────┤
│  ConnectedAccountWorkspaceEntity                             │
│  ├─ id: UUID                                                 │
│  ├─ handle: string (email/username)                          │
│  ├─ provider: ConnectedAccountProvider                       │
│  │   ├─ "google"                                             │
│  │   ├─ "microsoft"                                          │
│  │   ├─ "google-ads"                                         │
│  │   ├─ "google-analytics"                                   │
│  │   ├─ "meta-ads"                                           │
│  │   └─ "imap-smtp-caldav"                                   │
│  ├─ accessToken: string (OAuth2)                             │
│  ├─ refreshToken: string (OAuth2)                            │
│  ├─ scopes: string[] (permissões)                            │
│  ├─ syncConfig: JSON (configurações específicas)             │
│  ├─ authFailedAt: Date | null                                │
│  └─ accountOwnerId → WorkspaceMember                          │
│                                                              │
│  Relacionamentos (ONE-TO-MANY):                              │
│  ├─ messageChannels[] → MessageChannel                       │
│  ├─ calendarChannels[] → CalendarChannel                     │
│  └─ marketingChannels[] → MarketingChannel                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              OAuth2 Client Manager                           │
├──────────────────────────────────────────────────────────────┤
│  OAuth2ClientManagerService                                  │
│  ├─ getGoogleOAuth2Client()          → Gmail, Calendar      │
│  ├─ getGoogleAdsOAuth2Client()       → Google Ads           │
│  ├─ getGoogleAnalyticsOAuth2Client() → GA4                  │
│  ├─ getMicrosoftOAuth2Client()       → Outlook              │
│  └─ getMetaAdsOAuth2Client()         → Facebook Ads         │
│                                                              │
│  Drivers (implementações específicas):                       │
│  ├─ google/                   (Gmail, Calendar)             │
│  ├─ google-ads/               (Google Ads API)              │
│  ├─ google-analytics/         (GA4 Data API)                │
│  ├─ meta-ads/                 (Facebook Business SDK)       │
│  └─ microsoft/                (Microsoft Graph API)         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│           Refresh Tokens Manager                             │
├──────────────────────────────────────────────────────────────┤
│  ConnectedAccountRefreshTokensService                        │
│  ├─ refreshAndSaveTokens()                                   │
│  │   ├─ Verifica se token expirou                            │
│  │   ├─ Usa refresh_token para obter novo access_token       │
│  │   ├─ Atualiza ConnectedAccount no banco                   │
│  │   └─ Retorna tokens atualizados                           │
│  │                                                            │
│  └─ Drivers específicos:                                     │
│      └─ microsoft/ (lógica específica de refresh Microsoft)  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Como Cada Módulo Usa ConnectedAccount

### 📧 Messaging Module

```
User conecta Gmail
    ↓
ConnectedAccount criada
├─ provider: "google"
├─ handle: "user@gmail.com"
├─ accessToken: "ya29.xxx"
└─ refreshToken: "1//xxx"
    ↓
Event: "connectedAccount.created"
    ↓
ConnectedAccountListener (em messaging/)
    └─ Cria MessageChannel
        ├─ connectedAccountId: <id>
        └─ syncStage: PENDING
    ↓
Messaging usa OAuth2ClientManager:
    googleClient = oauth2Manager.getGoogleOAuth2Client(connectedAccount)
    └─ gmail = googleClient.gmail({ version: 'v1' })
    └─ messages = gmail.users.messages.list(...)
```

**Messaging importa:**
```typescript
@Module({
  imports: [
    OAuth2ClientManagerModule,  // ✅ Apenas OAuth2
  ],
})
```

---

### 📅 Calendar Module

```
User conecta Google Calendar
    ↓
ConnectedAccount criada (mesma do Gmail se já existe)
├─ provider: "google"
└─ scopes: ['gmail', 'calendar']  ← Permissões combinadas
    ↓
Event: "connectedAccount.created"
    ↓
ConnectedAccountListener (em calendar/)
    └─ Cria CalendarChannel
        ├─ connectedAccountId: <id>
        └─ syncStage: PENDING
    ↓
Calendar usa OAuth2ClientManager:
    googleClient = oauth2Manager.getGoogleOAuth2Client(connectedAccount)
    └─ calendar = googleClient.calendar({ version: 'v3' })
    └─ events = calendar.events.list(...)
```

**Calendar importa:**
```typescript
@Module({
  imports: [
    OAuth2ClientManagerModule,  // ✅ Apenas OAuth2
  ],
})
```

---

### 📊 Marketing Module (ATUAL - Incorreto)

```
User conecta Google Ads
    ↓
ConnectedAccount criada
├─ provider: "google-ads"
├─ handle: "user@gmail.com"
└─ refreshToken: "1//xxx"
    ↓
❌ PROBLEMA: Marketing tem services EM connected-account
    GoogleAdsAccountService (connected-account/services/) ❌
    ↓
Marketing usa diretamente:
    googleAdsAccountService.fetchAccounts() ❌ (service errado lugar)
```

**Marketing importa (ERRADO):**
```typescript
@Module({
  imports: [
    OAuth2ClientManagerModule,  // ✅ OK
  ],
  providers: [
    GoogleAdsAccountService,    // ❌ De connected-account!
  ],
})
```

---

### 📊 Marketing Module (DEPOIS - Correto)

```
User conecta Google Ads
    ↓
ConnectedAccount criada
├─ provider: "google-ads"
└─ refreshToken: "1//xxx"
    ↓
Event: "connectedAccount.created" (se implementar listener)
    ↓
Marketing cria MarketingChannel
    ├─ connectedAccountId: <id>
    ├─ type: "google-ads"
    └─ syncStage: PENDING
    ↓
Marketing usa OAuth2ClientManager:
    googleAdsClient = oauth2Manager.getGoogleAdsOAuth2Client(connectedAccount)
    └─ customer = googleAdsClient.Customer(...)
    └─ campaigns = customer.query(...)
```

**Marketing importa (CORRETO):**
```typescript
// marketing/marketing-accounts-manager/marketing-accounts-manager.module.ts
@Module({
  imports: [
    OAuth2ClientManagerModule,  // ✅ Apenas OAuth2
  ],
  providers: [
    GoogleAdsAccountService,    // ✅ Dentro de marketing!
  ],
})
```

---

## 📊 Modelo de Dados (Relacionamentos)

```sql
-- Tabela Core (compartilhada entre workspaces)
core.connectedAccount
    ├─ id
    ├─ provider ("google", "google-ads", "microsoft", etc)
    ├─ accessToken
    ├─ refreshToken
    └─ accountOwnerId → workspace_member.id

-- Tabelas por Workspace
workspace_xxx.messageChannel
    ├─ id
    ├─ connectedAccountId → core.connectedAccount.id
    └─ ... (config específico de messaging)

workspace_xxx.calendarChannel
    ├─ id
    ├─ connectedAccountId → core.connectedAccount.id
    └─ ... (config específico de calendar)

workspace_xxx.marketingChannel
    ├─ id
    ├─ connectedAccountId → core.connectedAccount.id
    ├─ type ("google-ads", "google-analytics", "meta-ads")
    └─ ... (config específico de marketing)
```

### Exemplo de Dados

```sql
-- Um usuário conecta Google
INSERT INTO core.connectedAccount (
  id, provider, handle, accessToken, refreshToken, scopes
) VALUES (
  'conn-123',
  'google',
  'user@gmail.com',
  'ya29.xxx',
  '1//xxx',
  ['gmail.readonly', 'calendar.readonly']
);

-- Cria MessageChannel automaticamente
INSERT INTO workspace_xxx.messageChannel (
  id, connectedAccountId, handle
) VALUES (
  'msg-456',
  'conn-123',
  'user@gmail.com'
);

-- Cria CalendarChannel automaticamente
INSERT INTO workspace_xxx.calendarChannel (
  id, connectedAccountId, handle
) VALUES (
  'cal-789',
  'conn-123',
  'user@gmail.com'
);

-- Resultado:
-- UMA ConnectedAccount → MÚLTIPLOS Channels
```

---

## 🔐 OAuth2 Flow Detalhado

### Primeira Conexão

```
1. User clica "Connect with Google Ads"
   ↓
2. Frontend redirect:
   https://accounts.google.com/o/oauth2/auth?
     client_id=xxx
     &redirect_uri=http://localhost:3000/auth/google/redirect
     &scope=https://www.googleapis.com/auth/adwords
     &response_type=code
   ↓
3. User autoriza app
   ↓
4. Google redirect:
   http://localhost:3000/auth/google/redirect?code=AUTHORIZATION_CODE
   ↓
5. Backend: AuthController.googleRedirect()
   ↓
6. OAuth2ClientManager.exchangeCodeForTokens()
   POST https://oauth2.googleapis.com/token
   Body: {
     code: "AUTHORIZATION_CODE",
     client_id: "xxx",
     client_secret: "yyy",
     grant_type: "authorization_code"
   }
   ↓
7. Google Response:
   {
     access_token: "ya29.xxx",    (expira em 1h)
     refresh_token: "1//xxx",     (expira em 90 dias)
     expires_in: 3600,
     scope: "https://www.googleapis.com/auth/adwords"
   }
   ↓
8. Backend salva ConnectedAccount:
   INSERT INTO connectedAccount (
     provider: "google-ads",
     accessToken: "ya29.xxx",
     refreshToken: "1//xxx",
     scopes: ["adwords"]
   )
```

### Sincronizações Seguintes (Token Refresh)

```
Cron job de marketing roda (6h depois)
    ↓
GoogleAdsDataFetchService.fetchCampaigns()
    ↓
Busca ConnectedAccount do banco
    ├─ accessToken: "ya29.xxx" (EXPIRADO!)
    └─ refreshToken: "1//xxx"
    ↓
ConnectedAccountRefreshTokensService.refreshAndSaveTokens()
    ├─ Detecta que accessToken expirou
    ↓
    POST https://oauth2.googleapis.com/token
    Body: {
      refresh_token: "1//xxx",
      client_id: "xxx",
      client_secret: "yyy",
      grant_type: "refresh_token"
    }
    ↓
    Response:
    {
      access_token: "ya29.NEW_TOKEN",  (novo token!)
      expires_in: 3600
    }
    ↓
    UPDATE connectedAccount
    SET accessToken = "ya29.NEW_TOKEN"
    ↓
Usa novo token para chamar Google Ads API:
    ├─ Authorization: Bearer ya29.NEW_TOKEN
    └─ Fetch campaigns, metrics, etc
```

---

## 📊 Diagrama de Uso por Módulo

```
┌─────────────────────────────────────────────────────────────┐
│                    ConnectedAccount                          │
│                  (Infraestrutura Central)                    │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Messaging   │  │   Calendar   │  │  Marketing   │
│   Module     │  │    Module    │  │    Module    │
└──────────────┘  └──────────────┘  └──────────────┘
     │                  │                  │
     ├─ MessageChannel  ├─ CalendarChannel ├─ MarketingChannel
     │                  │                  │
     └─ Usa:            └─ Usa:            └─ Usa:
        getGoogleOAuth2    getGoogleOAuth2    getGoogleAdsOAuth2
        Client()           Client()           Client()


Fluxo de Cada Módulo:

┌────────────────────────────────────────────────────────────┐
│  1. ConnectedAccount é criada (OAuth2)                     │
│     └─ Armazena tokens                                     │
├────────────────────────────────────────────────────────────┤
│  2. Módulo específico cria seu Channel                     │
│     ├─ MessageChannel (para messaging)                     │
│     ├─ CalendarChannel (para calendar)                     │
│     └─ MarketingChannel (para marketing)                   │
├────────────────────────────────────────────────────────────┤
│  3. Channel gerencia sync                                  │
│     ├─ syncStatus, syncStage                               │
│     ├─ syncCursor (pagination)                             │
│     └─ Usa ConnectedAccount.tokens para API calls          │
├────────────────────────────────────────────────────────────┤
│  4. Módulo NÃO sabe de outros módulos                      │
│     ├─ Messaging não sabe de Calendar                      │
│     ├─ Calendar não sabe de Marketing                      │
│     └─ Apenas compartilham ConnectedAccount                │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Por Que ConnectedAccount É Compartilhado?

### Cenário Real

```
User: "Quero conectar meu Gmail"
    ↓
Sistema: Cria 1 ConnectedAccount
    ├─ provider: "google"
    ├─ scopes: ['gmail', 'calendar']
    └─ tokens: xxx
    ↓
Sistema cria AUTOMATICAMENTE:
    ├─ MessageChannel (para emails)
    └─ CalendarChannel (para eventos)

Benefícios:
✅ Um único OAuth2 flow
✅ Um único refresh token
✅ Menos chamadas à API Google
✅ UX melhor (conecta uma vez, usa em tudo)
```

### Múltiplos Providers para Um User

```sql
-- User conecta Google para email/calendar
INSERT INTO connectedAccount (provider='google', handle='user@gmail.com');
  └─ messageChannel (user@gmail.com)
  └─ calendarChannel (user@gmail.com)

-- User conecta Google Ads separadamente
INSERT INTO connectedAccount (provider='google-ads', handle='user@gmail.com');
  └─ marketingChannel (type='google-ads')

-- User conecta Google Analytics
INSERT INTO connectedAccount (provider='google-analytics', handle='user@gmail.com');
  └─ marketingChannel (type='google-analytics')

-- User conecta Microsoft
INSERT INTO connectedAccount (provider='microsoft', handle='user@outlook.com');
  └─ messageChannel (user@outlook.com)
  └─ calendarChannel (user@outlook.com)

-- Result:
-- 4 ConnectedAccounts
-- 5 Channels (2 message, 2 calendar, 2 marketing)
```

---

## 🔧 Como Usar ConnectedAccount (Padrão Correto)

### ❌ ERRADO (Marketing atual)

```typescript
// connected-account/services/google-ads-account.service.ts ❌
@Injectable()
export class GoogleAdsAccountService {
  // Lógica de NEGÓCIO de marketing aqui ❌
  async fetchAdAccounts() {
    // ...
  }
}

// marketing.module.ts
@Module({
  providers: [
    GoogleAdsAccountService,  // ❌ Service de connected-account
  ],
})
```

**Por que é errado?**
- ConnectedAccount tem lógica de negócio de Marketing
- Quebra separação de responsabilidades
- ConnectedAccount fica "poluído"

---

### ✅ CORRETO (Como Calendar faz)

```typescript
// calendar/calendar-event-import-manager/services/calendar-fetch.service.ts ✅
@Injectable()
export class CalendarFetchEventsService {
  constructor(
    private oauth2Manager: OAuth2ClientManagerService,  // ✅ USA o manager
  ) {}

  async fetchEvents(connectedAccount: ConnectedAccount) {
    // Pega client OAuth2 (infraestrutura)
    const googleClient = await this.oauth2Manager.getGoogleOAuth2Client(
      connectedAccount
    );

    // Usa client para lógica de NEGÓCIO de calendar
    const calendar = googleClient.calendar({ version: 'v3' });
    const events = await calendar.events.list({
      calendarId: 'primary',
      // ... lógica de calendar
    });

    return events;
  }
}

// calendar-event-import-manager.module.ts
@Module({
  imports: [
    OAuth2ClientManagerModule,  // ✅ Importa apenas o manager
  ],
  providers: [
    CalendarFetchEventsService,  // ✅ Service de calendar
  ],
})
```

**Por que é correto?**
- ✅ ConnectedAccount só provê OAuth2 (infraestrutura)
- ✅ Calendar tem sua própria lógica (negócio)
- ✅ Separação limpa de responsabilidades

---

## 🎯 Marketing Após Refatoração (Correto)

```typescript
// marketing/marketing-accounts-manager/services/google-ads-account.service.ts ✅
@Injectable()
export class GoogleAdsAccountService {
  constructor(
    private oauth2Manager: OAuth2ClientManagerService,  // ✅ USA o manager
  ) {}

  async fetchAdAccounts(connectedAccount: ConnectedAccount) {
    // Pega client OAuth2 (infraestrutura)
    const googleAdsClient = await this.oauth2Manager.getGoogleAdsOAuth2Client(
      connectedAccount
    );

    // Lógica de NEGÓCIO de marketing
    const accounts = await googleAdsClient.listAccessibleCustomers(...);

    return accounts;
  }
}

// marketing/marketing-accounts-manager/marketing-accounts-manager.module.ts
@Module({
  imports: [
    OAuth2ClientManagerModule,  // ✅ Importa apenas o manager
  ],
  providers: [
    GoogleAdsAccountService,    // ✅ Service de marketing (local)
  ],
})
export class MarketingAccountsManagerModule {}
```

**Por que é correto?**
- ✅ ConnectedAccount só provê OAuth2
- ✅ Marketing tem sua própria lógica
- ✅ **IGUAL ao Calendar!**

---

## 📋 Regras de Ouro

### 1️⃣ ConnectedAccount Deve Ser Agnóstico

```
✅ ConnectedAccount PODE:
  - Gerenciar OAuth2
  - Armazenar tokens
  - Refresh tokens
  - Prover clients OAuth2

❌ ConnectedAccount NÃO PODE:
  - Ter lógica de Calendar
  - Ter lógica de Messaging
  - Ter lógica de Marketing
  - Saber sobre entities específicas
```

### 2️⃣ Módulos Devem Importar OAuth2Manager

```
✅ CORRETO:
@Module({
  imports: [OAuth2ClientManagerModule],
  providers: [MyService],  // Service do próprio módulo
})

❌ ERRADO:
@Module({
  imports: [ConnectedAccountModule],
  providers: [ServiceDeOutroModulo],  // ❌
})
```

### 3️⃣ Cada Channel é Independente

```
✅ Independência:
  MessageChannel não sabe de CalendarChannel
  CalendarChannel não sabe de MarketingChannel

✅ Compartilham apenas:
  ConnectedAccount (tokens OAuth2)
```

---

## 🎓 Analogia do Mundo Real

### ConnectedAccount = Crachá de Acesso

```
Empresa XYZ tem:
  - Escritório (Calendar)
  - Email Server (Messaging)
  - Sistema de Marketing (Marketing)

ConnectedAccount = Crachá do funcionário
  ├─ Dá acesso a todos os sistemas
  ├─ Tem código de segurança (tokens)
  └─ Precisa renovar periodicamente (refresh)

Cada sistema usa o crachá:
  ├─ Email usa crachá para autenticar
  ├─ Calendar usa crachá para autenticar
  └─ Marketing usa crachá para autenticar

MAS:
  ❌ Crachá NÃO tem lógica de como enviar email
  ❌ Crachá NÃO tem lógica de como criar evento
  ❌ Crachá NÃO tem lógica de como criar campanha

  ✅ Crachá APENAS autentica
  ✅ Cada sistema tem sua própria lógica
```

---

## 📊 Resumo Visual Final

```
┌─────────────────────────────────────────────────┐
│           O QUE VOCÊ ESTÁ FAZENDO               │
└─────────────────────────────────────────────────┘

REMOVENDO de ConnectedAccount:
  ❌ GoogleAdsAccountService
  ❌ GoogleAnalyticsPropertyService
  ❌ MarketingAccountsResolver

COLOCANDO em Marketing:
  ✅ marketing/marketing-accounts-manager/
     └─ Esses 3 services movidos para cá

ORGANIZANDO Marketing:
  ✅ marketing.module.ts → Agregador puro
  ✅ marketing-accounts-manager/ → Novo submódulo
  ✅ marketing-apis-manager/ → Novo submódulo
  ✅ marketing-realtime-manager/ → marketing-ads-manager renomeado

RESULTADO:
  ✅ ConnectedAccount limpo (só OAuth2)
  ✅ Marketing organizado (como Calendar)
  ✅ Padrão consistente em todo projeto
```

---

**Agora você está pronto para começar a refatoração! Use o [CHECKLIST](./REFATORACAO-CHECKLIST.md) para executar.** 🚀

**Última atualização:** Outubro 2025

