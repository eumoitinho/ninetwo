import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';

// Common services
import { MarketingChannelSyncStatusService } from 'src/modules/marketing/common/services/marketing-channel-sync-status.service';

// Sync services (consolidated)
import { MarketingDataFetchService } from 'src/modules/marketing/sync/services/marketing-data-fetch.service';
import { MarketingDataImportService } from 'src/modules/marketing/sync/services/marketing-data-import.service';
import { MarketingDataStorageService } from 'src/modules/marketing/sync/services/marketing-data-storage.service';
import { GoogleAdsDataFetchService } from 'src/modules/marketing/sync/services/drivers/google-ads-data-fetch.service';
import { GoogleAnalyticsDataFetchService } from 'src/modules/marketing/sync/services/drivers/google-analytics-data-fetch.service';

// Sync jobs and crons
import { MarketingDataFetchCronCommand } from 'src/modules/marketing/sync/crons/commands/marketing-data-fetch.cron.command';
import { MarketingDataFetchCronJob } from 'src/modules/marketing/sync/crons/jobs/marketing-data-fetch.cron.job';
import { MarketingDataFetchJob } from 'src/modules/marketing/sync/jobs/marketing-data-fetch.job';
import { MarketingDataImportJob } from 'src/modules/marketing/sync/jobs/marketing-data-import.job';

// API services (consolidated)
import { MarketingAPIsService } from 'src/modules/marketing/services/marketing-apis.service';
import { GoogleAnalyticsPropertyService } from 'src/modules/marketing/services/google-analytics-property.service';
import { CampaignManagerService } from 'src/modules/marketing/services/campaign-manager.service';
import { GoogleAdsSyncService } from 'src/modules/marketing/services/google-ads-sync.service';
import { GoogleAnalyticsSyncService } from 'src/modules/marketing/services/google-analytics-sync.service';

// Resolvers (consolidated)
import { MarketingChannelResolver } from 'src/modules/marketing/resolvers/marketing-channel.resolver';
import { MarketingAdsResolver } from 'src/modules/marketing/resolvers/marketing-ads.resolver';

/**
 * Simplified Marketing Module
 *
 * Consolidates all marketing functionality:
 * - Entities: AdsCampaign, AnalyticsData, MarketingChannel (from common/)
 * - Sync: Background jobs, crons, data fetching/import
 * - APIs: Connection management, account selection
 * - Resolvers: GraphQL endpoints
 *
 * Follows the same pattern as messaging and calendar modules
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureFlag, Workspace, DataSourceEntity]),
    WorkspaceDataSourceModule,
    RefreshTokensManagerModule,
    ConnectedAccountModule,
    OAuth2ClientManagerModule,
    NinetwoORMModule,
  ],
  providers: [
    // === Common Services ===
    MarketingChannelSyncStatusService,

    // === Sync Services ===
    MarketingDataFetchService,
    MarketingDataImportService,
    MarketingDataStorageService,
    GoogleAdsDataFetchService,
    GoogleAnalyticsDataFetchService,

    // === API Services ===
    MarketingAPIsService,
    GoogleAnalyticsPropertyService,
    CampaignManagerService,
    GoogleAdsSyncService,
    GoogleAnalyticsSyncService,

    // === Background Jobs ===
    MarketingDataFetchCronJob,
    MarketingDataFetchCronCommand,
    MarketingDataFetchJob,
    MarketingDataImportJob,

    // === GraphQL Resolvers ===
    MarketingChannelResolver,
    MarketingAdsResolver,
  ],
  exports: [
    // Export key services for other modules
    MarketingDataFetchService,
    MarketingAPIsService,
    MarketingDataFetchCronCommand,
  ],
})
export class MarketingModule {}