# 📅 Fluxo Completo do Sistema Calendar - Ninetwo

Este documento mapeia o fluxo **completo** do módulo Calendar, desde a configuração inicial no frontend até a sincronização automática no backend.

---

## 🗺️ Visão Geral do Fluxo

```
USUÁRIO
   ↓
1. CONFIGURAÇÃO (OAuth + UI)
   ↓
2. CRIAÇÃO DO CANAL
   ↓
3. SINCRONIZAÇÃO AUTOMÁTICA (Cron Jobs)
   ↓
4. VISUALIZAÇÃO NO FRONTEND
```

---

## 📊 Diagrama de Arquitetura do Calendar

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CALENDAR MODULE                               │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (ninetwo-front)                       │
├────────────────────────────────────────────────────────────────────┤
│  Pages:                                                             │
│  └─ /settings/accounts                                              │
│     └─ SettingsAccountsConfiguration.tsx                            │
│        ├─ Email step (MessageChannel)                               │
│        └─ Calendar step (CalendarChannel)                           │
│                                                                      │
│  Components:                                                         │
│  └─ SettingsAccountsListEmptyStateCard                              │
│     ├─ "Connect with Google" button                                 │
│     └─ "Connect with Microsoft" button                              │
│                                                                      │
│  GraphQL Queries:                                                    │
│  ├─ GET_CALENDAR_CHANNELS (lista canais)                            │
│  └─ START_CHANNEL_SYNC (inicia sincronização)                       │
└────────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. OAuth Flow
                              │ 2. GraphQL Mutation
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                      BACKEND (ninetwo-server)                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               calendar.module.ts (Raiz)                      │  │
│  │  ├─ CalendarCommonModule                                     │  │
│  │  ├─ CalendarEventImportManagerModule                         │  │
│  │  ├─ CalendarEventParticipantManagerModule                    │  │
│  │  ├─ CalendarBlocklistManagerModule                           │  │
│  │  └─ CalendarEventCleanerModule                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         calendar-event-import-manager/ (Core Sync)           │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Cron Jobs (*/5 * * * *) - A cada 5 minutos:                │  │
│  │  ├─ CalendarEventListFetchCronJob                            │  │
│  │  │   └─ Busca workspaces ativos                              │  │
│  │  │   └─ Busca calendar channels pendentes                    │  │
│  │  │   └─ Cria jobs CalendarEventListFetchJob                  │  │
│  │  │                                                            │  │
│  │  ├─ CalendarEventsImportCronJob                              │  │
│  │  │   └─ Processa importação de eventos                       │  │
│  │  │                                                            │  │
│  │  └─ CalendarOngoingStaleCronJob                              │  │
│  │      └─ Reseta syncs travados                                │  │
│  │                                                                  │
│  │  Background Jobs (BullMQ):                                   │  │
│  │  ├─ CalendarEventListFetchJob                                │  │
│  │  │   └─ CalendarFetchEventsService                           │  │
│  │  │       └─ CalendarGetCalendarEventsService                 │  │
│  │  │           ├─ GoogleCalendarGetEventsService               │  │
│  │  │           ├─ MicrosoftCalendarGetEventsService            │  │
│  │  │           └─ CalDavGetEventsService                       │  │
│  │  │                                                            │  │
│  │  ├─ CalendarEventsImportJob                                  │  │
│  │  │   └─ CalendarEventsImportService                          │  │
│  │  │       └─ CalendarSaveEventsService                        │  │
│  │  │           └─ Salva no banco (TypeORM)                     │  │
│  │  │                                                            │  │
│  │  └─ CalendarOngoingStaleJob                                  │  │
│  │                                                                  │
│  │  Services:                                                   │  │
│  │  ├─ CalendarChannelSyncStatusService (gerencia estados)     │  │
│  │  ├─ CalendarAccountAuthenticationService (refresh tokens)   │  │
│  │  └─ CalendarEventImportExceptionHandlerService              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │    calendar-event-participant-manager/                       │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Jobs:                                                       │  │
│  │  ├─ CalendarEventParticipantMatchParticipantJob              │  │
│  │  │   └─ Faz match participante → pessoa/company             │  │
│  │  │                                                            │  │
│  │  └─ CalendarCreateCompanyAndContactAfterSyncJob              │  │
│  │      └─ Cria contatos automaticamente                        │  │
│  │                                                                  │
│  │  Listeners:                                                  │  │
│  │  └─ Reage a eventos de calendar criados                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         calendar/common/ (Entities & Services)               │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Entities:                                                   │  │
│  │  ├─ CalendarChannelWorkspaceEntity                           │  │
│  │  ├─ CalendarEventWorkspaceEntity                             │  │
│  │  ├─ CalendarEventParticipantWorkspaceEntity                  │  │
│  │  └─ CalendarChannelEventAssociationWorkspaceEntity           │  │
│  │                                                                  │
│  │  Services:                                                   │  │
│  │  └─ CalendarChannelSyncStatusService                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  workspace_xxx.calendarChannel                                      │
│  ├─ id (UUID)                                                       │
│  ├─ handle (email)                                                  │
│  ├─ connectedAccountId → connected_account.id                       │
│  ├─ syncStatus (NOT_SYNCED, ONGOING, ACTIVE, FAILED_...)            │
│  ├─ syncStage (PENDING, FETCH_ONGOING, IMPORT_ONGOING, ...)         │
│  ├─ syncCursor (token para próxima sincronização)                   │
│  ├─ syncedAt (última sync bem sucedida)                             │
│  ├─ isSyncEnabled (boolean)                                         │
│  └─ throttleFailureCount (contador de falhas)                       │
│                                                                      │
│  workspace_xxx.calendarEvent                                        │
│  ├─ id (UUID)                                                       │
│  ├─ title (título do evento)                                        │
│  ├─ description (descrição)                                         │
│  ├─ location (local)                                                │
│  ├─ startsAt (data/hora início)                                     │
│  ├─ endsAt (data/hora fim)                                          │
│  ├─ isCanceled (boolean)                                            │
│  ├─ isFullDay (boolean)                                             │
│  ├─ iCalUID (ID único do evento)                                    │
│  ├─ conferenceSolution (Zoom, Meet, Teams, etc)                     │
│  └─ conferenceLink (link da conferência)                            │
│                                                                      │
│  workspace_xxx.calendarChannelEventAssociation                      │
│  ├─ id (UUID)                                                       │
│  ├─ calendarChannelId → calendar_channel.id                         │
│  ├─ calendarEventId → calendar_event.id                             │
│  └─ eventExternalId (ID no provedor externo)                        │
│                                                                      │
│  workspace_xxx.calendarEventParticipant                             │
│  ├─ id (UUID)                                                       │
│  ├─ calendarEventId → calendar_event.id                             │
│  ├─ personId → person.id (se matched)                               │
│  ├─ workspaceMemberId → workspace_member.id (se matched)            │
│  ├─ handle (email do participante)                                  │
│  ├─ displayName (nome do participante)                              │
│  ├─ isOrganizer (boolean)                                           │
│  └─ responseStatus (ACCEPTED, DECLINED, TENTATIVE, NEEDS_ACTION)    │
│                                                                      │
│  core.connectedAccount                                              │
│  ├─ id (UUID)                                                       │
│  ├─ provider (google, microsoft, imap-smtp-caldav)                  │
│  ├─ accessToken                                                     │
│  ├─ refreshToken                                                    │
│  └─ accountOwnerId → workspace_member.id                            │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL APIS                                 │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  Google Calendar │  │ Outlook Calendar │  │  CalDAV Server  │  │
│  │  API v3          │  │ (MS Graph API)   │  │  (generic)      │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo 1: Configuração Inicial (OAuth)

### Visualmente

```
┌─────────┐
│ USUÁRIO │
└────┬────┘
     │ 1. Acessa /settings/accounts
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  FRONTEND: SettingsAccountsListEmptyStateCard                    │
│    └─ Renderiza botões:                                          │
│       ├─ "Connect with Google" (se isGoogleCalendarEnabled)      │
│       └─ "Connect with Microsoft" (se isMicrosoftCalendarEnabled)│
└────┬─────────────────────────────────────────────────────────────┘
     │ 2. User clica "Connect with Google"
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  FRONTEND: triggerApisOAuth(ConnectedAccountProvider.GOOGLE)     │
│    └─ Parâmetros:                                                │
│       ├─ messageVisibility: SHARE_EVERYTHING                     │
│       └─ calendarVisibility: SHARE_EVERYTHING                    │
└────┬─────────────────────────────────────────────────────────────┘
     │ 3. Redirect para Google OAuth
     │    URL: https://accounts.google.com/o/oauth2/v2/auth
     │    Scopes: calendar.readonly, calendar.events
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  GOOGLE OAUTH                                                     │
│    └─ Usuário faz login e autoriza                               │
│    └─ Redirect: /auth/google/callback?code=AUTHORIZATION_CODE    │
└────┬─────────────────────────────────────────────────────────────┘
     │ 4. Callback com authorization code
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  BACKEND: AuthController.googleCallback()                         │
│    ↓                                                              │
│  OAuth2ClientManagerService.exchangeCodeForTokens()               │
│    ├─ Troca code por access_token + refresh_token                │
│    └─ Expira em ~1 hora (access) e ~90 dias (refresh)            │
│    ↓                                                              │
│  ConnectedAccountService.createOrUpdate()                         │
│    ├─ Cria/atualiza ConnectedAccount                             │
│    │  ├─ provider: "google"                                      │
│    │  ├─ handle: "user@gmail.com"                                │
│    │  ├─ accessToken: "ya29.xxx"                                 │
│    │  └─ refreshToken: "1//xxx"                                  │
│    ↓                                                              │
│  Event: "connectedAccount.created"                                │
└────┬─────────────────────────────────────────────────────────────┘
     │ 5. Event listener cria canais
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  BACKEND: ConnectedAccountListener                                │
│    ↓                                                              │
│  CRIA CalendarChannel:                                            │
│    ├─ handle: "user@gmail.com"                                   │
│    ├─ connectedAccountId: <id da connected account>              │
│    ├─ syncStatus: NOT_SYNCED                                     │
│    ├─ syncStage: PENDING_CONFIGURATION                           │
│    ├─ isSyncEnabled: true                                        │
│    ├─ syncCursor: ""                                             │
│    └─ visibility: SHARE_EVERYTHING                               │
└────┬─────────────────────────────────────────────────────────────┘
     │ 6. Frontend exibe configuração
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  FRONTEND: SettingsAccountsConfiguration                          │
│    ├─ Step 1: Email Configuration (MessageChannel)               │
│    ├─ Step 2: Calendar Configuration (CalendarChannel)           │
│    └─ Button: "Add Account" → START_CHANNEL_SYNC mutation        │
└────┬─────────────────────────────────────────────────────────────┘
     │ 7. Mutation START_CHANNEL_SYNC
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  BACKEND: startChannelSync resolver                               │
│    ↓                                                              │
│  Atualiza CalendarChannel:                                        │
│    ├─ syncStage: CALENDAR_EVENT_LIST_FETCH_PENDING               │
│    └─ syncStatus: ONGOING                                        │
│    ↓                                                              │
│  Adiciona job à fila:                                             │
│    └─ CalendarEventListFetchJob                                  │
└────┬─────────────────────────────────────────────────────────────┘
     │
     ↓
   [FLUXO 2: Sincronização Automática]
```

---

## 🔄 Fluxo 2: Sincronização Automática (Background)

### Pipeline Completo de Sincronização

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CRON JOB (*/5 * * * *)                          │
│                  Roda a cada 5 minutos                              │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  CalendarEventListFetchCronJob.handle()                             │
│    ↓                                                                │
│  1. Busca workspaces ativos (WHERE activationStatus = ACTIVE)      │
│    ↓                                                                │
│  2. Para cada workspace:                                            │
│     SELECT * FROM workspace_xxx.calendarChannel                     │
│     WHERE isSyncEnabled = true                                      │
│       AND syncStage IN (                                            │
│         'CALENDAR_EVENT_LIST_FETCH_PENDING',                        │
│         'PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING'                 │
│       )                                                             │
│    ↓                                                                │
│  3. Para cada calendar channel encontrado:                          │
│     messageQueueService.add(                                        │
│       CalendarEventListFetchJob,                                   │
│       { calendarChannelId, workspaceId }                           │
│     )                                                               │
└────┬────────────────────────────────────────────────────────────────┘
     │ Jobs criados na fila BullMQ
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  REDIS (BullMQ Queue)                                               │
│    Queue: "calendar-queue"                                          │
│    └─ Job: CalendarEventListFetchJob                                │
│       Data: { calendarChannelId: "xxx", workspaceId: "yyy" }        │
└────┬────────────────────────────────────────────────────────────────┘
     │ Worker processa job
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  WORKER: CalendarEventListFetchJob.handle()                         │
│    ↓                                                                │
│  1. Busca CalendarChannel do banco:                                 │
│     WHERE id = calendarChannelId AND isSyncEnabled = true           │
│     RELATIONS: ['connectedAccount']                                 │
│    ↓                                                                │
│  2. Verifica throttle (evita retry excessivo se falhou recente):   │
│     isThrottled(syncStageStartedAt, throttleFailureCount)           │
│     └─ Se throttled: return (aguarda próximo cron)                  │
│    ↓                                                                │
│  3. Verifica syncStage:                                             │
│     Se != CALENDAR_EVENT_LIST_FETCH_PENDING: return                │
│    ↓                                                                │
│  4. Chama CalendarEventsImportService.processCalendarEventsImport() │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  CalendarFetchEventsService.fetchCalendarEvents()                   │
│    ↓                                                                │
│  PASSO 1: Atualiza status                                           │
│    └─ syncStage: CALENDAR_EVENT_LIST_FETCH_ONGOING                  │
│       syncStageStartedAt: now()                                     │
│    ↓                                                                │
│  PASSO 2: Refresh tokens se necessário                              │
│    CalendarAccountAuthenticationService.validateAndRefreshTokens()  │
│    ├─ Verifica se access_token está próximo de expirar              │
│    ├─ Se sim: usa refresh_token para obter novo access_token        │
│    └─ Atualiza ConnectedAccount com novos tokens                    │
│    ↓                                                                │
│  PASSO 3: Busca eventos do provedor                                 │
│    CalendarGetCalendarEventsService.getCalendarEvents()             │
│    ├─ Switch por provider:                                          │
│    │  ├─ google → GoogleCalendarGetEventsService                    │
│    │  ├─ microsoft → MicrosoftCalendarGetEventsService             │
│    │  └─ imap-smtp-caldav → CalDavGetEventsService                 │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  GoogleCalendarGetEventsService.getCalendarEvents()                 │
│    ↓                                                                │
│  Google Calendar API v3:                                            │
│    GET /calendars/primary/events?                                   │
│        syncToken=xxx         (incremental sync)                     │
│        &maxResults=500                                              │
│        &showDeleted=true     (para processar cancelamentos)         │
│    ↓                                                                │
│  Response:                                                          │
│    {                                                                │
│      items: [                                                       │
│        {                                                            │
│          id: "event123",                                            │
│          summary: "Reunião com cliente",                            │
│          start: { dateTime: "2025-10-26T10:00:00Z" },               │
│          end: { dateTime: "2025-10-26T11:00:00Z" },                 │
│          attendees: [                                               │
│            { email: "cliente@example.com", displayName: "Cliente" } │
│          ],                                                         │
│          conferenceData: { ... }                                    │
│        },                                                           │
│        ...                                                          │
│      ],                                                             │
│      nextSyncToken: "yyy"  // Para próxima sincronização            │
│    }                                                                │
│    ↓                                                                │
│  Transform: formatGoogleCalendarEvents()                            │
│    └─ Converte formato Google → FetchedCalendarEvent               │
└────┬────────────────────────────────────────────────────────────────┘
     │ Return: { calendarEvents: [...], nextSyncCursor: "yyy" }
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  CalendarFetchEventsService (continuação)                           │
│    ↓                                                                │
│  PASSO 4: Filtragem e validação                                     │
│    filterEventsAndReturnCancelledEvents()                           │
│    ├─ Remove eventos de emails blocklistados                        │
│    ├─ Separa eventos cancelados                                     │
│    └─ Valida dados dos eventos                                      │
│    ↓                                                                │
│  PASSO 5: Armazenamento temporário (Redis)                          │
│    cacheStorage.set(                                                │
│      `calendar-events-to-import:${workspaceId}:${channelId}`,      │
│      eventIds                                                       │
│    )                                                                │
│    ↓                                                                │
│  PASSO 6: Atualiza cursor de sincronização                          │
│    UPDATE calendarChannel                                           │
│    SET syncCursor = nextSyncToken                                   │
│    ↓                                                                │
│  PASSO 7: Agenda importação                                         │
│    ├─ syncStage: CALENDAR_EVENTS_IMPORT_PENDING                     │
│    └─ Adiciona CalendarEventsImportJob à fila                       │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  REDIS (BullMQ Queue)                                               │
│    Queue: "calendar-queue"                                          │
│    └─ Job: CalendarEventsImportJob                                  │
│       Data: { calendarChannelId: "xxx", workspaceId: "yyy" }        │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  WORKER: CalendarEventsImportJob.handle()                           │
│    ↓                                                                │
│  CalendarEventsImportService.processCalendarEventsImport()          │
│    ↓                                                                │
│  PASSO 1: Atualiza status                                           │
│    └─ syncStage: CALENDAR_EVENTS_IMPORT_ONGOING                     │
│    ↓                                                                │
│  PASSO 2: Busca eventos do Redis (batch de 20)                      │
│    eventIds = cacheStorage.setPop(                                  │
│      `calendar-events-to-import:${workspaceId}:${channelId}`,      │
│      20  // CALENDAR_EVENT_IMPORT_BATCH_SIZE                       │
│    )                                                                │
│    ↓                                                                │
│  PASSO 3: Se provider é Microsoft, busca detalhes                   │
│    (Google já retorna tudo no passo anterior)                       │
│    MicrosoftCalendarImportEventService.getCalendarEvents()          │
│    ↓                                                                │
│  PASSO 4: Filtra novamente (blocklist)                              │
│    filterEventsAndReturnCancelledEvents()                           │
│    ↓                                                                │
│  PASSO 5: Salva no banco de dados                                   │
│    CalendarSaveEventsService.saveCalendarEventsAndEnqueueContactCreation() │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  CalendarSaveEventsService                                          │
│    ↓                                                                │
│  Para cada evento:                                                  │
│    ↓                                                                │
│  1. Upsert CalendarEvent:                                           │
│     INSERT INTO calendarEvent                                       │
│       (id, title, description, startsAt, endsAt, ...)               │
│     VALUES (...)                                                    │
│     ON CONFLICT (iCalUID, workspaceId)                              │
│     DO UPDATE SET ...                                               │
│    ↓                                                                │
│  2. Upsert CalendarChannelEventAssociation:                         │
│     INSERT INTO calendarChannelEventAssociation                     │
│       (calendarChannelId, calendarEventId, eventExternalId)         │
│     VALUES (...)                                                    │
│     ON CONFLICT DO NOTHING                                          │
│    ↓                                                                │
│  3. Upsert CalendarEventParticipant (para cada participante):      │
│     INSERT INTO calendarEventParticipant                            │
│       (calendarEventId, handle, displayName, isOrganizer, ...)      │
│     VALUES (...)                                                    │
│     ON CONFLICT (calendarEventId, handle)                           │
│     DO UPDATE SET ...                                               │
│    ↓                                                                │
│  4. Emit event para cada participante:                              │
│     eventEmitter.emit('calendarEventParticipant.matched', {         │
│       calendarEventParticipant,                                     │
│       workspaceId,                                                  │
│       workspaceMemberId                                             │
│     })                                                              │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  POSTGRESQL                                                         │
│    workspace_xxx schema:                                            │
│      ├─ calendarEvent (15 registros inseridos/atualizados)          │
│      ├─ calendarChannelEventAssociation (15 registros)              │
│      └─ calendarEventParticipant (45 registros, ~3 por evento)      │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  EVENT LISTENERS                                                    │
│    ↓                                                                │
│  CalendarEventParticipantListener                                   │
│    @OnEvent('calendarEventParticipant.matched')                     │
│    ↓                                                                │
│  Adiciona job: CalendarEventParticipantMatchParticipantJob          │
│    └─ Tenta fazer match do participante com Person existente       │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  CalendarEventParticipantMatchParticipantJob                        │
│    ↓                                                                │
│  1. Busca Person por email (handle):                                │
│     SELECT * FROM person WHERE email = 'cliente@example.com'        │
│    ↓                                                                │
│  2. Se encontrou:                                                   │
│     UPDATE calendarEventParticipant                                 │
│     SET personId = <person_id>                                      │
│    ↓                                                                │
│  3. Se não encontrou E política permite:                            │
│     (isContactAutoCreationEnabled = true)                           │
│     └─ Adiciona job: CalendarCreateCompanyAndContactAfterSyncJob    │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  CalendarCreateCompanyAndContactAfterSyncJob                        │
│    ↓                                                                │
│  Cria Person automaticamente:                                       │
│    INSERT INTO person (                                             │
│      email,                                                         │
│      firstName,    // Extrai de displayName                         │
│      lastName,     // Extrai de displayName                         │
│      createdAt,                                                     │
│      source: 'CALENDAR'                                             │
│    )                                                                │
│    ↓                                                                │
│  UPDATE calendarEventParticipant                                    │
│  SET personId = <novo_person_id>                                    │
└────┬────────────────────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────────────────────┐
│  Finalização da Importação                                          │
│    ↓                                                                │
│  Se ainda há eventos no Redis:                                      │
│    └─ Próximo cron adiciona novo CalendarEventsImportJob            │
│    ↓                                                                │
│  Se todos eventos foram importados:                                 │
│    UPDATE calendarChannel SET                                       │
│      syncStatus = ACTIVE,                                           │
│      syncStage = CALENDAR_EVENT_LIST_FETCH_PENDING,                 │
│      syncedAt = now(),                                              │
│      throttleFailureCount = 0                                       │
│    ↓                                                                │
│  Próximo cron (5 min) iniciará sincronização incremental:           │
│    └─ Usa syncCursor para buscar apenas novos/alterados             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Diagrama de Estados de Sincronização

```
Estado Inicial
    ↓
PENDING_CONFIGURATION
    ↓
[User configura no frontend]
    ↓
CALENDAR_EVENT_LIST_FETCH_PENDING ←──────┐
    ↓                                     │
CALENDAR_EVENT_LIST_FETCH_SCHEDULED       │
    ↓                                     │
CALENDAR_EVENT_LIST_FETCH_ONGOING         │
    ↓                                     │
CALENDAR_EVENTS_IMPORT_PENDING            │
    ↓                                     │
CALENDAR_EVENTS_IMPORT_SCHEDULED          │
    ↓                                     │
CALENDAR_EVENTS_IMPORT_ONGOING            │
    ↓                                     │
ACTIVE (sync completa)                    │
    ↓                                     │
[Aguarda 5 minutos...]                    │
    ↓                                     │
CALENDAR_EVENT_LIST_FETCH_PENDING ────────┘
    (sincronização incremental com syncToken)

Se erro em qualquer etapa:
    ↓
FAILED
    ↓
[Cron: CalendarOngoingStaleCronJob reseta após timeout]
    ↓
CALENDAR_EVENT_LIST_FETCH_PENDING (tenta novamente)
```

---

## 🗄️ Modelo de Dados (Database Schema)

### Relacionamentos

```sql
-- Workspace específico
workspace_xxx.calendarChannel (1)
    ↓ ONE-TO-MANY
workspace_xxx.calendarChannelEventAssociation (N)
    ↓ MANY-TO-ONE
workspace_xxx.calendarEvent (1)
    ↓ ONE-TO-MANY
workspace_xxx.calendarEventParticipant (N)
    ↓ MANY-TO-ONE (nullable)
workspace_xxx.person (0..1)

-- Cross workspace
core.connectedAccount (1)
    ↓ ONE-TO-MANY
workspace_xxx.calendarChannel (N)
```

### Exemplo de Dados

```sql
-- CalendarChannel
┌──────────────────────────────────┬───────────────┬──────────┬────────────────┐
│ id                               │ handle        │ provider │ syncStatus     │
├──────────────────────────────────┼───────────────┼──────────┼────────────────┤
│ 550e8400-e29b-41d4-a716-446655440 │ user@gmail.com│ google   │ ACTIVE         │
└──────────────────────────────────┴───────────────┴──────────┴────────────────┘

-- CalendarEvent
┌──────────────────────────────────┬───────────────────┬──────────────────┬─────────────────┐
│ id                               │ title             │ startsAt         │ iCalUID         │
├──────────────────────────────────┼───────────────────┼──────────────────┼─────────────────┤
│ 660e8400-e29b-41d4-a716-446655440 │ Reunião Cliente   │ 2025-10-26 10:00 │ event123@google │
│ 770e8400-e29b-41d4-a716-446655440 │ Demo Produto      │ 2025-10-27 14:00 │ event456@google │
└──────────────────────────────────┴───────────────────┴──────────────────┴─────────────────┘

-- CalendarEventParticipant
┌──────────────────────────────────┬───────────────────┬──────────────────────┬────────────┐
│ id                               │ calendarEventId   │ handle               │ personId   │
├──────────────────────────────────┼───────────────────┼──────────────────────┼────────────┤
│ 880e8400-e29b-41d4-a716-446655440 │ 660e8400-e29b...  │ cliente@example.com  │ <person_id>│
│ 990e8400-e29b-41d4-a716-446655440 │ 660e8400-e29b...  │ user@gmail.com       │ NULL       │
└──────────────────────────────────┴───────────────────┴──────────────────────┴────────────┘
```

---

## 🎨 Fluxo 3: Visualização no Frontend

```
┌─────────┐
│ USUÁRIO │
└────┬────┘
     │ Acessa app (ex: /objects/calendarEvents)
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  FRONTEND: CalendarEventsPage (usa sistema genérico)             │
│    ↓                                                              │
│  useQuery(GET_CALENDAR_EVENTS)                                    │
│    query {                                                        │
│      calendarEvents {                                             │
│        id, title, startsAt, endsAt,                               │
│        calendarEventParticipants {                                │
│          handle, displayName, person { id, firstName }            │
│        }                                                          │
│      }                                                            │
│    }                                                              │
└────┬─────────────────────────────────────────────────────────────┘
     │ GraphQL Query
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  BACKEND: GraphQL Resolver (auto-gerado pelo sistema)            │
│    ↓                                                              │
│  CalendarEventResolver.calendarEvents()                           │
│    └─ (gerado automaticamente pelo workspace-schema-builder)     │
│    ↓                                                              │
│  TypeORM Repository.find()                                        │
│    SELECT * FROM workspace_xxx.calendarEvent                      │
│    LEFT JOIN calendarEventParticipant                             │
│    LEFT JOIN person                                               │
│    ORDER BY startsAt DESC                                         │
└────┬─────────────────────────────────────────────────────────────┘
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  POSTGRESQL                                                       │
│    Retorna eventos com participants e persons                     │
└────┬─────────────────────────────────────────────────────────────┘
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  BACKEND: Response GraphQL                                        │
│    {                                                              │
│      calendarEvents: [                                            │
│        {                                                          │
│          id: "660e8400-...",                                      │
│          title: "Reunião Cliente",                                │
│          startsAt: "2025-10-26T10:00:00Z",                        │
│          endsAt: "2025-10-26T11:00:00Z",                          │
│          calendarEventParticipants: [                             │
│            {                                                      │
│              handle: "cliente@example.com",                       │
│              displayName: "Cliente Silva",                        │
│              person: {                                            │
│                id: "person123",                                   │
│                firstName: "Cliente"                               │
│              }                                                    │
│            }                                                      │
│          ]                                                        │
│        }                                                          │
│      ]                                                            │
│    }                                                              │
└────┬─────────────────────────────────────────────────────────────┘
     │
┌────▼─────────────────────────────────────────────────────────────┐
│  FRONTEND: Apollo Client                                          │
│    ├─ Cache update                                                │
│    ├─ Recoil state update (se usado)                              │
│    └─ Component re-render                                         │
│    ↓                                                              │
│  UI:                                                              │
│    ┌─────────────────────────────────────────────┐               │
│    │ 📅 Reunião Cliente                          │               │
│    │    🕐 26/10/2025 10:00 - 11:00              │               │
│    │    👤 Cliente Silva (cliente@example.com)   │               │
│    │    📍 Sala de Reuniões                      │               │
│    │    🔗 Google Meet: meet.google.com/abc-def  │               │
│    └─────────────────────────────────────────────┘               │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔁 Sincronização Incremental (Sync Token)

### Como Funciona o Sync Token

```
PRIMEIRA SINCRONIZAÇÃO (Full Sync):
   ↓
Google Calendar API:
  GET /events?syncToken=null
  ↓
Response:
  {
    items: [evento1, evento2, ..., evento100],  // TODOS os eventos
    nextSyncToken: "abc123"
  }
  ↓
Salva no banco: 100 eventos
UPDATE calendarChannel SET syncCursor = "abc123"

═══════════════════════════════════════════════════════════════

SINCRONIZAÇÕES SEGUINTES (Incremental Sync):
   ↓
5 minutos depois...
   ↓
Google Calendar API:
  GET /events?syncToken=abc123  ← USA O TOKEN ANTERIOR
  ↓
Response:
  {
    items: [
      evento101 (novo),
      evento50 (modificado),
      evento25 (cancelado)
    ],  // APENAS MUDANÇAS desde último sync!
    nextSyncToken: "def456"
  }
  ↓
Processa apenas 3 eventos (muito mais rápido!)
UPDATE calendarChannel SET syncCursor = "def456"

═══════════════════════════════════════════════════════════════

5 minutos depois...
   ↓
GET /events?syncToken=def456
  ↓
Response: { items: [], nextSyncToken: "ghi789" }
  └─ Nenhuma mudança desde último sync!
```

**Benefícios:**
- ✅ **Performance:** Não refaz todo o trabalho
- ✅ **Menos API calls:** Google tem rate limits
- ✅ **Menos processamento:** Só processa mudanças

---

## ⏱️ Timeline de uma Sincronização Completa

```
T=0s    │ Cron job roda
        │ └─ Busca calendar channels pendentes
        │
T=0.5s  │ Job adicionado à fila BullMQ
        │
T=1s    │ Worker pega job
        │ └─ CalendarEventListFetchJob inicia
        │
T=1.5s  │ Refresh de tokens OAuth2
        │ └─ Troca refresh_token por novo access_token
        │
T=2s    │ Google Calendar API call
        │ └─ GET /calendars/primary/events?syncToken=xxx
        │
T=4s    │ Response com 50 eventos
        │ └─ Parsing e transformação
        │
T=5s    │ Filtragem (blocklist, validação)
        │
T=6s    │ Salva event IDs no Redis
        │ └─ Atualiza syncCursor no banco
        │
T=7s    │ Agenda import job
        │ └─ syncStage: CALENDAR_EVENTS_IMPORT_PENDING
        │
T=8s    │ CalendarEventsImportJob inicia
        │ └─ Busca 20 event IDs do Redis
        │
T=9s    │ Salva eventos no PostgreSQL (batch)
        │ └─ calendarEvent (20 inserts/updates)
        │ └─ calendarEventParticipant (60 inserts)
        │
T=10s   │ Emite eventos para matching
        │ └─ 60 jobs de match participant
        │
T=15s   │ Match jobs completados
        │ └─ 40 matched com Person existente
        │ └─ 20 criaram Person novo
        │
T=20s   │ Sync completa!
        │ └─ syncStatus: ACTIVE
        │
T=5min  │ Próximo cron roda
        │ └─ Sincronização incremental (apenas novos)
```

---

## 🔐 Fluxo de Autenticação (OAuth + Token Refresh)

```
CONFIGURAÇÃO INICIAL (uma vez):
┌─────────────────────────────────────────────┐
│ User autoriza Google Calendar               │
│   ↓                                         │
│ Backend recebe authorization code           │
│   ↓                                         │
│ Troca code por tokens:                      │
│   ├─ access_token (expira em 1h)           │
│   └─ refresh_token (expira em 90 dias)     │
│   ↓                                         │
│ Salva em ConnectedAccount                   │
└─────────────────────────────────────────────┘

SINCRONIZAÇÕES SEGUINTES:
┌─────────────────────────────────────────────┐
│ Job de sync inicia                          │
│   ↓                                         │
│ Verifica se access_token é válido:          │
│   ├─ Se válido: usa direto                  │
│   └─ Se expirado/perto de expirar:          │
│       ↓                                     │
│       POST https://oauth2.googleapis.com/token │
│       Body: {                               │
│         grant_type: "refresh_token",        │
│         refresh_token: "1//xxx",            │
│         client_id: "...",                   │
│         client_secret: "..."                │
│       }                                     │
│       ↓                                     │
│       Response: {                           │
│         access_token: "ya29.new_token",     │
│         expires_in: 3600                    │
│       }                                     │
│       ↓                                     │
│       UPDATE connectedAccount               │
│       SET accessToken = new_token           │
│   ↓                                         │
│ Usa access_token para chamar Calendar API  │
└─────────────────────────────────────────────┘
```

---

## 📈 Métricas e Monitoramento

### Logs Importantes

```typescript
// Durante sync
[CalendarEventListFetchCronJob] Found 3 calendar channels to sync
[CalendarEventListFetchJob] Processing calendar channel 550e8400...
[GoogleCalendarGetEventsService] Fetching events with syncToken: abc123
[GoogleCalendarGetEventsService] Retrieved 25 events
[CalendarSaveEventsService] Saving 25 calendar events
[CalendarEventParticipantMatchParticipantJob] Matched 15 participants with existing persons
[CalendarCreateCompanyAndContactAfterSyncJob] Created 10 new persons from calendar participants
[CalendarChannelSyncStatusService] Calendar channel 550e8400 sync completed successfully
```

### Estados de Erro

```typescript
// Insufficient permissions
syncStatus: FAILED_INSUFFICIENT_PERMISSIONS
└─ Google retornou 403 Forbidden
└─ Usuário revogou permissões

// Unknown error
syncStatus: FAILED_UNKNOWN
└─ Erro de rede, timeout, etc
└─ throttleFailureCount incrementado
└─ Retry com backoff exponencial

// Stale (travado)
CalendarOngoingStaleCronJob detecta:
└─ syncStageStartedAt > 30 minutos atrás
└─ Reseta para CALENDAR_EVENT_LIST_FETCH_PENDING
```

---

## 🎯 Análise do marketing.module.ts

Agora comparando com o Calendar:

### ❌ O que está DIFERENTE do padrão Calendar

```typescript
// marketing.module.ts
@Module({
  imports: [
    MarketingCommonModule,           // ✅ OK - igual Calendar
    MarketingImportManagerModule,    // ✅ OK - igual Calendar
    OAuth2ClientManagerModule,       // ❌ DIFERENTE - Calendar não importa aqui
    NinetwoORMModule,                // ❌ DIFERENTE - Calendar não importa aqui
  ],
  providers: [
    MarketingAPIsService,            // ❌ DIFERENTE - Calendar.providers = []
    MarketingChannelResolver,        // ❌ DIFERENTE - Calendar.providers = []
    MarketingAccountsResolver,       // ❌ DIFERENTE - De outro módulo!
    GoogleAdsAccountService,         // ❌ DIFERENTE - De outro módulo!
    GoogleAnalyticsPropertyService,  // ❌ DIFERENTE - De outro módulo!
  ],
  exports: [
    MarketingAPIsService,            // ❌ DIFERENTE - Calendar.exports = []
    MarketingImportManagerModule,    // ⚠️ OK, mas desnecessário
  ],
})
```

### ✅ Como Calendar faz (CORRETO)

```typescript
// calendar.module.ts
@Module({
  imports: [
    CalendarBlocklistManagerModule,          // Submódulo
    CalendarEventCleanerModule,              // Submódulo
    CalendarEventImportManagerModule,        // Submódulo
    CalendarEventParticipantManagerModule,   // Submódulo
    CalendarCommonModule,                    // Common
  ],
  providers: [],  // ✅ VAZIO - lógica nos submódulos
  exports: [],    // ✅ VAZIO - submódulos exportam se necessário
})
export class CalendarModule {}
```

**Onde Calendar coloca dependências:**

```typescript
// calendar-event-import-manager.module.ts
@Module({
  imports: [
    OAuth2ClientManagerModule,    // ← Aqui, DENTRO do submódulo
    NinetwoORMModule,              // ← Aqui, DENTRO do submódulo
    CalendarCommonModule,
    // ...
  ],
  providers: [
    CalendarFetchEventsService,
    CalendarSaveEventsService,
    // ... todos os services relacionados ao import
  ],
})
export class CalendarEventImportManagerModule {}
```

---

## 📋 Checklist de Conformidade

| Aspecto | Calendar | Marketing |
|---------|----------|-----------|
| **Módulo raiz apenas agrega** | ✅ Sim | ❌ Não (tem lógica) |
| **Providers vazio** | ✅ [] | ❌ 5 providers |
| **Exports vazio** | ✅ [] | ❌ 2 exports |
| **Dependências em submódulos** | ✅ Sim | ❌ No raiz |
| **Services de outros módulos** | ✅ Não | ❌ 3 services |
| **Common module** | ✅ Sim | ✅ Sim |
| **Import manager** | ✅ Sim | ✅ Sim |

---

## 🎯 Conclusão: Marketing NÃO segue o padrão

### Diferenças Principais:

#### 1. **Módulo Raiz com Lógica**
```typescript
// ❌ Marketing (errado)
providers: [MarketingAPIsService, MarketingChannelResolver, ...]

// ✅ Calendar (correto)
providers: []  // Lógica está nos submódulos
```

#### 2. **Services de Outros Módulos**
```typescript
// ❌ Marketing (errado)
providers: [
  GoogleAdsAccountService,        // De connected-account!
  GoogleAnalyticsPropertyService, // De connected-account!
]

// ✅ Calendar (correto)
// Não importa services de outros módulos no raiz
// Se precisa, importa o módulo completo ou cria submódulo
```

#### 3. **Dependências de Infraestrutura**
```typescript
// ❌ Marketing (errado)
imports: [
  OAuth2ClientManagerModule,  // No módulo raiz
  NinetwoORMModule,           // No módulo raiz
]

// ✅ Calendar (correto)
imports: [
  // Sem dependências de infra no raiz
  // Essas dependências estão DENTRO dos submódulos
]
```

---

## 🛠️ Como Refatorar Marketing para Seguir o Padrão

### Estrutura Ideal:

```
marketing/
├── marketing.module.ts                    ← Apenas agregador
│   @Module({
│     imports: [
│       MarketingCommonModule,
│       MarketingImportManagerModule,
│       MarketingRealtimeManagerModule,   ← marketing-ads-manager move para aqui
│       MarketingAccountsManagerModule,   ← Novo submódulo
│     ],
│     providers: [],  ← VAZIO
│     exports: [],    ← VAZIO
│   })
│
├── common/                                ← Entities compartilhadas
│   └── marketing-common.module.ts
│
├── marketing-import-manager/              ← Background sync (já existe)
│   ├── crons/
│   ├── jobs/
│   └── services/drivers/
│
├── marketing-realtime-manager/            ← Era marketing-ads-manager
│   ├── marketing-realtime-manager.module.ts
│   │   @Module({
│   │     imports: [
│   │       OAuth2ClientManagerModule,    ← Dependências AQUI
│   │       NinetwoORMModule,
│   │       MarketingCommonModule,
│   │     ],
│   │     providers: [
│   │       GoogleAdsSyncService,
│   │       MetaAdsSyncService,
│   │       CampaignManagerService,
│   │       MarketingAdsResolver,
│   │     ],
│   │   })
│   ├── resolvers/
│   └── services/
│
└── marketing-accounts-manager/            ← NOVO submódulo
    └── marketing-accounts-manager.module.ts
        @Module({
          imports: [OAuth2ClientManagerModule],
          providers: [
            GoogleAdsAccountService,       ← Move para cá
            GoogleAnalyticsPropertyService, ← Move para cá
            MarketingAccountsResolver,     ← Move para cá
          ],
        })
```

---

## 📝 Resumo Executivo

### **Padrão CORRETO** (Calendar/Messaging):
```
ModuloRaiz
├── apenas imports de submódulos
├── providers: []
└── exports: []

Submódulos
├── contém toda a lógica
├── importa dependências necessárias
└── exporta serviços para outros módulos
```

### **Padrão INCORRETO** (Marketing atual):
```
ModuloRaiz
├── imports submódulos + dependências de infra
├── providers: [services, resolvers, services de outros módulos]
└── exports: [services]

Módulo Separado (marketing-ads-manager)
├── mesmo nível hierárquico
└── deveria ser submódulo
```

---

## ✅ Ações Recomendadas

1. **Mover marketing-ads-manager** para dentro de `marketing/`
2. **Criar marketing-accounts-manager** como submódulo
3. **Limpar marketing.module.ts** para ser apenas agregador
4. **Mover dependências** de infra para dentro dos submódulos
5. **Remover providers e exports** do módulo raiz

Isso deixaria Marketing **100% consistente** com Calendar e Messaging! 🎯

---

**Última atualização:** Outubro 2025

