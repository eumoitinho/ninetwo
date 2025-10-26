import { Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { AdminPanelModule } from 'src/engine/core-modules/admin-panel/admin-panel.module';
import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { AppTokenModule } from 'src/engine/core-modules/app-token/app-token.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApprovedAccessDomainModule } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingWebhookModule } from 'src/engine/core-modules/billing-webhook/billing-webhook.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { TimelineCalendarEventModule } from 'src/engine/core-modules/calendar/timeline-calendar-event.module';
import { CaptchaModule } from 'src/engine/core-modules/captcha/captcha.module';
import { captchaModuleFactory } from 'src/engine/core-modules/captcha/captcha.module-factory';
import { CloudflareModule } from 'src/engine/core-modules/cloudflare/cloudflare.module';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { EmailingDomainModule } from 'src/engine/core-modules/emailing-domain/emailing-domain.module';
import { ExceptionHandlerModule } from 'src/engine/core-modules/exception-handler/exception-handler.module';
import { exceptionHandlerModuleFactory } from 'src/engine/core-modules/exception-handler/exception-handler.module-factory';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { GeoMapModule } from 'src/engine/core-modules/geo-map/geo-map-module';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { ImapSmtpCaldavModule } from 'src/engine/core-modules/imap-smtp-caldav-connection/imap-smtp-caldav-connection.module';
import { ImpersonationModule } from 'src/engine/core-modules/impersonation/impersonation.module';
import { LabModule } from 'src/engine/core-modules/lab/lab.module';
import { LoggerModule } from 'src/engine/core-modules/logger/logger.module';
import { loggerModuleFactory } from 'src/engine/core-modules/logger/logger.module-factory';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { messageQueueModuleFactory } from 'src/engine/core-modules/message-queue/message-queue.module-factory';
import { TimelineMessagingModule } from 'src/engine/core-modules/messaging/timeline-messaging.module';
import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';
import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';
import { OpenApiModule } from 'src/engine/core-modules/open-api/open-api.module';
import { PageLayoutModule } from 'src/engine/core-modules/page-layout/page-layout.module';
import { PostgresCredentialsModule } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.module';
import { PublicDomainModule } from 'src/engine/core-modules/public-domain/public-domain.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SearchModule } from 'src/engine/core-modules/search/search.module';
import { serverlessModuleFactory } from 'src/engine/core-modules/serverless/serverless-module.factory';
import { ServerlessModule } from 'src/engine/core-modules/serverless/serverless.module';
import { WorkspaceSSOModule } from 'src/engine/core-modules/sso/sso.module';
import { TelemetryModule } from 'src/engine/core-modules/telemetry/telemetry.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WebhookModule } from 'src/engine/core-modules/webhook/webhook.module';
import { WorkflowApiModule } from 'src/engine/core-modules/workflow/workflow-api.module';
import { WorkspaceInvitationModule } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { TrashCleanupModule } from 'src/engine/trash-cleanup/trash-cleanup.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { ChannelSyncModule } from 'src/modules/connected-account/channel-sync/channel-sync.module';
// import { MarketingAdsManagerModule } from 'src/modules/marketing-ads-manager/marketing-ads-manager.module';
import { MarketingModule } from 'src/modules/marketing/marketing.module';

import { AuditModule } from './audit/audit.module';
import { ClientConfigModule } from './client-config/client-config.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    NinetwoConfigModule.forRoot(),
    HealthModule,
    AuditModule,
    AuthModule,
    BillingModule,
    BillingWebhookModule,
    ClientConfigModule,
    FeatureFlagModule,
    FileModule,
    OpenApiModule,
    ApplicationModule,
    AppTokenModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
    WorkspaceInvitationModule,
    WorkspaceSSOModule,
    ApprovedAccessDomainModule,
    EmailingDomainModule,
    PublicDomainModule,
    CloudflareModule,
    DnsManagerModule,
    PostgresCredentialsModule,
    WorkflowApiModule,
    WorkspaceEventEmitterModule,
    ActorModule,
    TelemetryModule,
    AdminPanelModule,
    LabModule,
    RoleModule,
    RedisClientModule,
    WorkspaceQueryRunnerModule,
    GeoMapModule,
    SubscriptionsModule,
    ImapSmtpCaldavModule,
    ChannelSyncModule,
    MarketingModule,
    // MarketingAdsManagerModule,
    FileStorageModule.forRoot(),
    LoggerModule.forRootAsync({
      useFactory: loggerModuleFactory,
      inject: [NinetwoConfigService],
    }),
    MessageQueueModule.registerAsync({
      useFactory: messageQueueModuleFactory,
      inject: [NinetwoConfigService, RedisClientService],
    }),
    ExceptionHandlerModule.forRootAsync({
      useFactory: exceptionHandlerModuleFactory,
      inject: [NinetwoConfigService, HttpAdapterHost],
    }),
    EmailModule.forRoot(),
    CaptchaModule.forRoot({
      useFactory: captchaModuleFactory,
      inject: [NinetwoConfigService],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    CacheStorageModule,
    AiModule,
    ServerlessModule.forRootAsync({
      useFactory: serverlessModuleFactory,
      inject: [NinetwoConfigService, FileStorageService],
    }),
    SearchModule,
    ApiKeyModule,
    WebhookModule,
    PageLayoutModule,
    ImpersonationModule,
    TrashCleanupModule,
  ],
  exports: [
    AuditModule,
    AuthModule,
    FeatureFlagModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
    WorkspaceInvitationModule,
    WorkspaceSSOModule,
    ImapSmtpCaldavModule,
  ],
})
export class CoreEngineModule {}
