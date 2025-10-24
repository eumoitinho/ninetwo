import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';
import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';
import { MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import { MarketingDataFetchCronCommand } from 'src/modules/marketing/marketing-import-manager/crons/commands/marketing-data-fetch.cron.command';
import { MarketingDataFetchCronJob } from 'src/modules/marketing/marketing-import-manager/crons/jobs/marketing-data-fetch.cron.job';
import { MarketingDataFetchJob } from 'src/modules/marketing/marketing-import-manager/jobs/marketing-data-fetch.job';
import { MarketingDataImportJob } from 'src/modules/marketing/marketing-import-manager/jobs/marketing-data-import.job';
import { GoogleAdsDataFetchService } from 'src/modules/marketing/marketing-import-manager/services/drivers/google-ads-data-fetch.service';
import { GoogleAnalyticsDataFetchService } from 'src/modules/marketing/marketing-import-manager/services/drivers/google-analytics-data-fetch.service';
import { MarketingDataFetchService } from 'src/modules/marketing/marketing-import-manager/services/marketing-data-fetch.service';
import { MarketingDataImportService } from 'src/modules/marketing/marketing-import-manager/services/marketing-data-import.service';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([MarketingChannelWorkspaceEntity]),
    TypeOrmModule.forFeature([FeatureFlag, Workspace, DataSourceEntity]),
    WorkspaceDataSourceModule,
    RefreshTokensManagerModule,
    ConnectedAccountModule,
    MarketingCommonModule,
    OAuth2ClientManagerModule,
    NinetwoORMModule,
  ],
  providers: [
    MarketingDataFetchService,
    MarketingDataImportService,
    GoogleAdsDataFetchService,
    GoogleAnalyticsDataFetchService,
    MarketingDataFetchCronJob,
    MarketingDataFetchCronCommand,
    MarketingDataFetchJob,
    MarketingDataImportJob,
  ],
  exports: [
    MarketingDataFetchService,
    MarketingDataFetchCronCommand,
  ],
})
export class MarketingImportManagerModule {}

