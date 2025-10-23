import { msg } from '@lingui/core/macro';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/ninetwo-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/ninetwo-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/ninetwo-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/ninetwo-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/ninetwo-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/ninetwo-orm/decorators/workspace-relation.decorator';
import { MarketingCampaignWorkspaceEntity } from 'src/modules/marketing-ads-manager/standard-objects/marketing-campaign.workspace-entity';

@WorkspaceEntity({
  standardId: null,
  namePlural: 'marketingMetrics',
  labelSingular: msg`Marketing Metric`,
  labelPlural: msg`Marketing Metrics`,
  description: msg`Marketing metrics and performance data`,
  icon: 'IconChartBar',
})
@WorkspaceIsSystem()
export class MarketingMetricWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`Label`,
    description: msg`Metric label`,
    icon: 'IconTag',
  })
  label: string;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Date`,
    description: msg`Metric date`,
    icon: 'IconCalendar',
  })
  date: Date;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`Platform`,
    description: msg`Marketing platform`,
    icon: 'IconBrandGoogle',
  })
  platform: string;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`Device`,
    description: msg`Device type (mobile, desktop, tablet)`,
    icon: 'IconDeviceMobile',
  })
  @WorkspaceIsNullable()
  device: string | null;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`Currency Code`,
    description: msg`Currency code`,
    icon: 'IconCoin',
  })
  currencyCode: string;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.NUMBER,
    label: msg`Impressions`,
    description: msg`Number of impressions`,
    icon: 'IconEye',
  })
  impressions: number;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.NUMBER,
    label: msg`Clicks`,
    description: msg`Number of clicks`,
    icon: 'IconClick',
  })
  clicks: number;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.NUMBER,
    label: msg`Conversions`,
    description: msg`Number of conversions`,
    icon: 'IconCheck',
  })
  conversions: number;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.NUMBER,
    label: msg`Conversions Value`,
    description: msg`Total value of conversions`,
    icon: 'IconCoin',
  })
  @WorkspaceIsNullable()
  conversionsValue: number | null;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.NUMBER,
    label: msg`Cost Micros`,
    description: msg`Cost in micros`,
    icon: 'IconCurrencyDollar',
  })
  costMicros: number;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.NUMBER,
    label: msg`CTR`,
    description: msg`Click-through rate`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  ctr: number | null;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.NUMBER,
    label: msg`ROAS`,
    description: msg`Return on ad spend`,
    icon: 'IconTrendingUp',
  })
  @WorkspaceIsNullable()
  roas: number | null;

  @WorkspaceRelation({
    standardId: null,
    type: RelationMetadataType.MANY_TO_ONE,
    label: msg`Campaign`,
    description: msg`Associated marketing campaign`,
    icon: 'IconTarget',
    inverseSideTarget: () => MarketingCampaignWorkspaceEntity,
    inverseSideFieldKey: 'metrics',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  campaign: Relation<MarketingCampaignWorkspaceEntity>;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.UUID,
    label: msg`Campaign ID`,
    description: msg`Campaign ID foreign key`,
    icon: 'IconLink',
  })
  campaignId: string;
}
