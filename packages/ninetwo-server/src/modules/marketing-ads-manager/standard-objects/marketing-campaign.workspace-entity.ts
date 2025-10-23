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
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@WorkspaceEntity({
  standardId: null, // Will be auto-generated
  namePlural: 'marketingCampaigns',
  labelSingular: msg`Marketing Campaign`,
  labelPlural: msg`Marketing Campaigns`,
  description: msg`Marketing campaign from connected ad platforms`,
  icon: 'IconTarget',
})
@WorkspaceIsSystem()
export class MarketingCampaignWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Campaign name`,
    icon: 'IconTextSize',
  })
  name: string;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`Platform`,
    description: msg`Marketing platform (Google Ads, Meta Ads, etc.)`,
    icon: 'IconBrandGoogle',
  })
  platform: string;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`External ID`,
    description: msg`Campaign ID from the platform`,
    icon: 'IconHash',
  })
  externalId: string;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`Status`,
    description: msg`Campaign status`,
    icon: 'IconCircleDot',
  })
  status: string;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.NUMBER,
    label: msg`Daily Budget`,
    description: msg`Daily budget in account currency`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  dailyBudget: number | null;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Budget`,
    description: msg`Total budget in account currency`,
    icon: 'IconCash',
  })
  @WorkspaceIsNullable()
  totalBudget: number | null;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`Currency Code`,
    description: msg`Currency code (USD, BRL, etc.)`,
    icon: 'IconCoin',
  })
  currencyCode: string;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.TEXT,
    label: msg`Customer ID`,
    description: msg`Ad account customer ID`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  customerId: string | null;

  @WorkspaceRelation({
    standardId: null,
    type: RelationMetadataType.MANY_TO_ONE,
    label: msg`Connected Account`,
    description: msg`Connected account for this campaign`,
    icon: 'IconPlugConnected',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'marketingCampaigns',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  connectedAccount: Relation<ConnectedAccountWorkspaceEntity>;

  @WorkspaceField({
    standardId: null,
    type: FieldMetadataType.UUID,
    label: msg`Connected Account ID`,
    description: msg`Connected Account ID foreign key`,
    icon: 'IconLink',
  })
  connectedAccountId: string;
}
