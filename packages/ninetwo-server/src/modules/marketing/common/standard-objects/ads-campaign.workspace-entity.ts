import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'ninetwo-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/ninetwo-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/ninetwo-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/ninetwo-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/ninetwo-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/ninetwo-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/ninetwo-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/ninetwo-orm/decorators/workspace-relation.decorator';
import { ADS_CAMPAIGN_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.adsCampaign,
  namePlural: 'adsCampaigns',
  labelSingular: msg`Ads Campaign`,
  labelPlural: msg`Ads Campaigns`,
  description: msg`Marketing Advertising Campaigns`,
  icon: STANDARD_OBJECT_ICONS.adsCampaign,
  labelIdentifierStandardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
export class AdsCampaignWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Campaign name`,
    icon: 'IconTag',
  })
  name: string;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.externalId,
    type: FieldMetadataType.TEXT,
    label: msg`External ID`,
    description: msg`Campaign ID from the ads platform`,
    icon: 'IconKey',
  })
  externalId: string;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.TEXT,
    label: msg`Status`,
    description: msg`Campaign status (ENABLED, PAUSED, REMOVED)`,
    icon: 'IconStatusChange',
  })
  status: string;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.advertisingChannelType,
    type: FieldMetadataType.TEXT,
    label: msg`Channel Type`,
    description: msg`Advertising channel type (SEARCH, DISPLAY, VIDEO, etc)`,
    icon: 'IconBrandGoogle',
  })
  @WorkspaceIsNullable()
  advertisingChannelType: string | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.budget,
    type: FieldMetadataType.NUMBER,
    label: msg`Budget`,
    description: msg`Campaign budget in micros`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  budget: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.impressions,
    type: FieldMetadataType.NUMBER,
    label: msg`Impressions`,
    description: msg`Total impressions`,
    icon: 'IconEye',
  })
  @WorkspaceIsNullable()
  impressions: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.clicks,
    type: FieldMetadataType.NUMBER,
    label: msg`Clicks`,
    description: msg`Total clicks`,
    icon: 'IconClick',
  })
  @WorkspaceIsNullable()
  clicks: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.costMicros,
    type: FieldMetadataType.NUMBER,
    label: msg`Cost (Micros)`,
    description: msg`Total cost in micros`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  costMicros: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.conversions,
    type: FieldMetadataType.NUMBER,
    label: msg`Conversions`,
    description: msg`Total conversions`,
    icon: 'IconTarget',
  })
  @WorkspaceIsNullable()
  conversions: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.conversionValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Conversion Value`,
    description: msg`Total conversion value in micros`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  conversionValue: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.ctr,
    type: FieldMetadataType.NUMBER,
    label: msg`CTR`,
    description: msg`Click-through rate (%)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  ctr: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.averageCpc,
    type: FieldMetadataType.NUMBER,
    label: msg`Average CPC`,
    description: msg`Average cost per click in micros`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  averageCpc: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.averageCpa,
    type: FieldMetadataType.NUMBER,
    label: msg`Average CPA`,
    description: msg`Average cost per acquisition in micros`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  averageCpa: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.roas,
    type: FieldMetadataType.NUMBER,
    label: msg`ROAS`,
    description: msg`Return on ad spend`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  roas: number | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.customerId,
    type: FieldMetadataType.TEXT,
    label: msg`Customer ID`,
    description: msg`Google Ads customer ID`,
    icon: 'IconUser',
  })
  customerId: string;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.startDate,
    type: FieldMetadataType.DATE,
    label: msg`Start Date`,
    description: msg`Campaign start date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  startDate: string | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.endDate,
    type: FieldMetadataType.DATE,
    label: msg`End Date`,
    description: msg`Campaign end date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  endDate: string | null;

  @WorkspaceField({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.lastSyncedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last Synced At`,
    description: msg`When this campaign was last synced`,
    icon: 'IconRefresh',
  })
  @WorkspaceIsNullable()
  lastSyncedAt: Date | null;

  @WorkspaceRelation({
    standardId: ADS_CAMPAIGN_STANDARD_FIELD_IDS.marketingChannel,
    type: RelationType.MANY_TO_ONE,
    label: msg`Marketing Channel`,
    description: msg`Marketing Channel`,
    icon: 'IconBrandGoogle',
    inverseSideTarget: () => MarketingChannelWorkspaceEntity,
    inverseSideFieldKey: 'adsCampaigns',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  marketingChannel: Relation<MarketingChannelWorkspaceEntity>;

  @WorkspaceJoinColumn('marketingChannel')
  marketingChannelId: string;
}

