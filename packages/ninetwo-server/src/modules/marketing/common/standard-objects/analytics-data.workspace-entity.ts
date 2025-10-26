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
import { ANALYTICS_DATA_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { AdsCampaignWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/ads-campaign.workspace-entity';
import { MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.analyticsData,
  namePlural: 'analyticsData',
  labelSingular: msg`Analytics Data`,
  labelPlural: msg`Analytics Data`,
  description: msg`Google Analytics 4 Data`,
  icon: STANDARD_OBJECT_ICONS.analyticsData,
})
export class AnalyticsDataWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.date,
    type: FieldMetadataType.DATE,
    label: msg`Date`,
    description: msg`Date of the analytics data`,
    icon: 'IconCalendar',
  })
  date: string;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.propertyId,
    type: FieldMetadataType.TEXT,
    label: msg`Property ID`,
    description: msg`Google Analytics property ID`,
    icon: 'IconKey',
  })
  propertyId: string;

  // Traffic Metrics
  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.sessions,
    type: FieldMetadataType.NUMBER,
    label: msg`Sessions`,
    description: msg`Total sessions`,
    icon: 'IconUsers',
  })
  @WorkspaceIsNullable()
  sessions: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.totalUsers,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Users`,
    description: msg`Total users`,
    icon: 'IconUsers',
  })
  @WorkspaceIsNullable()
  totalUsers: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.newUsers,
    type: FieldMetadataType.NUMBER,
    label: msg`New Users`,
    description: msg`New users`,
    icon: 'IconUserPlus',
  })
  @WorkspaceIsNullable()
  newUsers: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.activeUsers,
    type: FieldMetadataType.NUMBER,
    label: msg`Active Users`,
    description: msg`Active users in the period`,
    icon: 'IconUsers',
  })
  @WorkspaceIsNullable()
  activeUsers: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.screenPageViews,
    type: FieldMetadataType.NUMBER,
    label: msg`Page Views`,
    description: msg`Total page/screen views`,
    icon: 'IconEye',
  })
  @WorkspaceIsNullable()
  screenPageViews: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.screenPageViewsPerSession,
    type: FieldMetadataType.NUMBER,
    label: msg`Pages/Session`,
    description: msg`Average pages per session`,
    icon: 'IconEye',
  })
  @WorkspaceIsNullable()
  screenPageViewsPerSession: number | null;

  // Engagement Metrics
  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.averageSessionDuration,
    type: FieldMetadataType.NUMBER,
    label: msg`Avg Session Duration`,
    description: msg`Average session duration in seconds`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  averageSessionDuration: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.bounceRate,
    type: FieldMetadataType.NUMBER,
    label: msg`Bounce Rate`,
    description: msg`Bounce rate (%)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  bounceRate: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.engagementRate,
    type: FieldMetadataType.NUMBER,
    label: msg`Engagement Rate`,
    description: msg`Engagement rate (%)`,
    icon: 'IconPercentage',
  })
  @WorkspaceIsNullable()
  engagementRate: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.engagedSessions,
    type: FieldMetadataType.NUMBER,
    label: msg`Engaged Sessions`,
    description: msg`Total engaged sessions`,
    icon: 'IconUsers',
  })
  @WorkspaceIsNullable()
  engagedSessions: number | null;

  // Conversion Metrics
  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.conversions,
    type: FieldMetadataType.NUMBER,
    label: msg`Conversions`,
    description: msg`Total conversions`,
    icon: 'IconTarget',
  })
  @WorkspaceIsNullable()
  conversions: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.totalRevenue,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Revenue`,
    description: msg`Total revenue`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  totalRevenue: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.ecommercePurchases,
    type: FieldMetadataType.NUMBER,
    label: msg`Purchases`,
    description: msg`Total ecommerce purchases`,
    icon: 'IconShoppingCart',
  })
  @WorkspaceIsNullable()
  ecommercePurchases: number | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.purchaseRevenue,
    type: FieldMetadataType.NUMBER,
    label: msg`Purchase Revenue`,
    description: msg`Revenue from purchases`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  purchaseRevenue: number | null;

  // Dimension Fields
  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.sessionSource,
    type: FieldMetadataType.TEXT,
    label: msg`Source`,
    description: msg`Traffic source`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  sessionSource: string | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.sessionMedium,
    type: FieldMetadataType.TEXT,
    label: msg`Medium`,
    description: msg`Traffic medium`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  sessionMedium: string | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.sessionCampaign,
    type: FieldMetadataType.TEXT,
    label: msg`Campaign`,
    description: msg`Campaign name from URL parameters`,
    icon: 'IconTag',
  })
  @WorkspaceIsNullable()
  sessionCampaign: string | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.deviceCategory,
    type: FieldMetadataType.TEXT,
    label: msg`Device Category`,
    description: msg`Device category (desktop, mobile, tablet)`,
    icon: 'IconDeviceMobile',
  })
  @WorkspaceIsNullable()
  deviceCategory: string | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.country,
    type: FieldMetadataType.TEXT,
    label: msg`Country`,
    description: msg`User country`,
    icon: 'IconWorld',
  })
  @WorkspaceIsNullable()
  country: string | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.city,
    type: FieldMetadataType.TEXT,
    label: msg`City`,
    description: msg`User city`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  city: string | null;

  @WorkspaceField({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.landingPage,
    type: FieldMetadataType.TEXT,
    label: msg`Landing Page`,
    description: msg`Landing page path`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  landingPage: string | null;

  @WorkspaceRelation({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.linkedCampaign,
    type: RelationType.MANY_TO_ONE,
    label: msg`Linked Campaign`,
    description: msg`Ads campaign linked via UTM`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => AdsCampaignWorkspaceEntity,
    inverseSideFieldKey: 'analyticsData',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  linkedCampaign: Relation<AdsCampaignWorkspaceEntity> | null;

  @WorkspaceJoinColumn('linkedCampaign')
  linkedCampaignId: string | null;

  @WorkspaceRelation({
    standardId: ANALYTICS_DATA_STANDARD_FIELD_IDS.marketingChannel,
    type: RelationType.MANY_TO_ONE,
    label: msg`Marketing Channel`,
    description: msg`Marketing Channel`,
    icon: 'IconBrandGoogle',
    inverseSideTarget: () => MarketingChannelWorkspaceEntity,
    inverseSideFieldKey: 'analyticsData',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  marketingChannel: Relation<MarketingChannelWorkspaceEntity>;

  @WorkspaceJoinColumn('marketingChannel')
  marketingChannelId: string;
}

