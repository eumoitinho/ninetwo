import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'ninetwo-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/ninetwo-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/ninetwo-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/ninetwo-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/ninetwo-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/ninetwo-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/ninetwo-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/ninetwo-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/ninetwo-orm/decorators/workspace-relation.decorator';
import { MARKETING_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { AdsCampaignWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/ads-campaign.workspace-entity';
import { AnalyticsDataWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/analytics-data.workspace-entity';

export enum MarketingChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum MarketingChannelSyncStage {
  PENDING_CONFIGURATION = 'PENDING_CONFIGURATION',
  ACCOUNT_SELECTION_PENDING = 'ACCOUNT_SELECTION_PENDING',
  DATA_FETCH_PENDING = 'DATA_FETCH_PENDING',
  DATA_FETCH_SCHEDULED = 'DATA_FETCH_SCHEDULED',
  DATA_FETCH_ONGOING = 'DATA_FETCH_ONGOING',
  DATA_IMPORT_PENDING = 'DATA_IMPORT_PENDING',
  DATA_IMPORT_SCHEDULED = 'DATA_IMPORT_SCHEDULED',
  DATA_IMPORT_ONGOING = 'DATA_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export enum MarketingChannelType {
  GOOGLE_ADS = 'google-ads',
  GOOGLE_ANALYTICS = 'google-analytics',
  META_ADS = 'meta-ads',
}

registerEnumType(MarketingChannelSyncStatus, {
  name: 'MarketingChannelSyncStatus',
});

registerEnumType(MarketingChannelSyncStage, {
  name: 'MarketingChannelSyncStage',
});

registerEnumType(MarketingChannelType, {
  name: 'MarketingChannelType',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.marketingChannel,
  namePlural: 'marketingChannels',
  labelSingular: msg`Marketing Channel`,
  labelPlural: msg`Marketing Channels`,
  description: msg`Marketing Channels`,
  icon: STANDARD_OBJECT_ICONS.marketingChannel,
  labelIdentifierStandardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MarketingChannelWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: msg`Handle`,
    description: msg`Handle (email or account identifier)`,
    icon: 'IconAt',
  })
  handle: string;

  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: msg`Type`,
    description: msg`Marketing Channel Type`,
    icon: 'IconBrandGoogle',
    options: [
      {
        value: MarketingChannelType.GOOGLE_ADS,
        label: 'Google Ads',
        position: 0,
        color: 'blue',
      },
      {
        value: MarketingChannelType.GOOGLE_ANALYTICS,
        label: 'Google Analytics',
        position: 1,
        color: 'orange',
      },
      {
        value: MarketingChannelType.META_ADS,
        label: 'Meta Ads',
        position: 2,
        color: 'purple',
      },
    ],
    defaultValue: `'${MarketingChannelType.GOOGLE_ADS}'`,
  })
  type: MarketingChannelType;

  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
    type: FieldMetadataType.SELECT,
    label: msg`Sync status`,
    description: msg`Sync status`,
    icon: 'IconStatusChange',
    options: [
      {
        value: MarketingChannelSyncStatus.ONGOING,
        label: 'Ongoing',
        position: 1,
        color: 'yellow',
      },
      {
        value: MarketingChannelSyncStatus.NOT_SYNCED,
        label: 'Not Synced',
        position: 2,
        color: 'blue',
      },
      {
        value: MarketingChannelSyncStatus.ACTIVE,
        label: 'Active',
        position: 3,
        color: 'green',
      },
      {
        value: MarketingChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
        label: 'Failed Insufficient Permissions',
        position: 4,
        color: 'red',
      },
      {
        value: MarketingChannelSyncStatus.FAILED_UNKNOWN,
        label: 'Failed Unknown',
        position: 5,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsNullable()
  syncStatus: MarketingChannelSyncStatus | null;

  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.syncStage,
    type: FieldMetadataType.SELECT,
    label: msg`Sync stage`,
    description: msg`Sync stage`,
    icon: 'IconStatusChange',
    options: [
      {
        value: MarketingChannelSyncStage.PENDING_CONFIGURATION,
        label: 'Pending Configuration',
        position: 0,
        color: 'blue',
      },
      {
        value: MarketingChannelSyncStage.ACCOUNT_SELECTION_PENDING,
        label: 'Account Selection Pending',
        position: 1,
        color: 'orange',
      },
      {
        value: MarketingChannelSyncStage.DATA_FETCH_PENDING,
        label: 'Data Fetch Pending',
        position: 2,
        color: 'orange',
      },
      {
        value: MarketingChannelSyncStage.DATA_FETCH_SCHEDULED,
        label: 'Data Fetch Scheduled',
        position: 3,
        color: 'yellow',
      },
      {
        value: MarketingChannelSyncStage.DATA_FETCH_ONGOING,
        label: 'Data Fetch Ongoing',
        position: 4,
        color: 'yellow',
      },
      {
        value: MarketingChannelSyncStage.DATA_IMPORT_PENDING,
        label: 'Data Import Pending',
        position: 5,
        color: 'orange',
      },
      {
        value: MarketingChannelSyncStage.DATA_IMPORT_SCHEDULED,
        label: 'Data Import Scheduled',
        position: 6,
        color: 'yellow',
      },
      {
        value: MarketingChannelSyncStage.DATA_IMPORT_ONGOING,
        label: 'Data Import Ongoing',
        position: 7,
        color: 'yellow',
      },
      {
        value: MarketingChannelSyncStage.FAILED,
        label: 'Failed',
        position: 8,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsNullable()
  syncStage: MarketingChannelSyncStage | null;

  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: msg`Sync Cursor`,
    description: msg`Sync Cursor for pagination`,
    icon: 'IconReload',
  })
  syncCursor: string;

  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last sync date`,
    description: msg`Last sync date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  syncedAt: Date | null;

  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Sync stage started at`,
    description: msg`Sync stage started at`,
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  syncStageStartedAt: Date | null;

  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Sync Enabled`,
    description: msg`Is Sync Enabled`,
    icon: 'IconRefresh',
    defaultValue: true,
  })
  isSyncEnabled: boolean;

  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
    type: FieldMetadataType.NUMBER,
    label: msg`Throttle Failure Count`,
    description: msg`Throttle Failure Count`,
    icon: 'IconX',
    defaultValue: 0,
  })
  throttleFailureCount: number;

  @WorkspaceField({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.accountConfig,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Account Configuration`,
    description: msg`JSON object containing account IDs and configuration`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  accountConfig: Record<string, never> | null;

  @WorkspaceRelation({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: RelationType.MANY_TO_ONE,
    label: msg`Connected Account`,
    description: msg`Connected Account`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'marketingChannels',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  connectedAccount: Relation<ConnectedAccountWorkspaceEntity>;

  @WorkspaceJoinColumn('connectedAccount')
  connectedAccountId: string;

  @WorkspaceRelation({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.adsCampaigns,
    type: RelationType.ONE_TO_MANY,
    label: msg`Ads Campaigns`,
    description: msg`Ads Campaigns`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => AdsCampaignWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  adsCampaigns: Relation<AdsCampaignWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MARKETING_CHANNEL_STANDARD_FIELD_IDS.analyticsData,
    type: RelationType.ONE_TO_MANY,
    label: msg`Analytics Data`,
    description: msg`Analytics Data`,
    icon: 'IconChartBar',
    inverseSideTarget: () => AnalyticsDataWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  analyticsData: Relation<AnalyticsDataWorkspaceEntity[]>;
}
