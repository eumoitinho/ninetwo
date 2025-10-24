import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'ninetwo-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/ninetwo-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/ninetwo-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/ninetwo-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/ninetwo-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/ninetwo-orm/decorators/workspace-is-system.decorator';
import { MARKETING_DASHBOARD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.marketingDashboard,
  namePlural: 'marketingDashboards',
  labelSingular: msg`Marketing Dashboard`,
  labelPlural: msg`Marketing Dashboards`,
  description: msg`Marketing Performance Dashboards`,
  icon: STANDARD_OBJECT_ICONS.marketingDashboard,
  labelIdentifierStandardId: MARKETING_DASHBOARD_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
export class MarketingDashboardWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MARKETING_DASHBOARD_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Dashboard name`,
    icon: 'IconTag',
  })
  name: string;

  @WorkspaceField({
    standardId: MARKETING_DASHBOARD_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Dashboard description`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  description: string | null;

  @WorkspaceField({
    standardId: MARKETING_DASHBOARD_STANDARD_FIELD_IDS.kpiConfig,
    type: FieldMetadataType.RAW_JSON,
    label: msg`KPI Configuration`,
    description: msg`JSON configuration for KPIs and metrics`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  kpiConfig: Record<string, any> | null;

  @WorkspaceField({
    standardId: MARKETING_DASHBOARD_STANDARD_FIELD_IDS.dateRange,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Date Range`,
    description: msg`Default date range for the dashboard`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  dateRange: Record<string, any> | null;

  @WorkspaceField({
    standardId: MARKETING_DASHBOARD_STANDARD_FIELD_IDS.filters,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Filters`,
    description: msg`Dashboard filters configuration`,
    icon: 'IconFilter',
  })
  @WorkspaceIsNullable()
  filters: Record<string, any> | null;

  @WorkspaceField({
    standardId: MARKETING_DASHBOARD_STANDARD_FIELD_IDS.isDefault,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Default`,
    description: msg`Is this the default dashboard`,
    icon: 'IconStar',
    defaultValue: false,
  })
  isDefault: boolean;

  @WorkspaceField({
    standardId: MARKETING_DASHBOARD_STANDARD_FIELD_IDS.layout,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Layout`,
    description: msg`Dashboard layout configuration`,
    icon: 'IconLayoutDashboard',
  })
  @WorkspaceIsNullable()
  layout: Record<string, any> | null;
}

