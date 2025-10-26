import { msg } from '@lingui/core/macro';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  MARKETING_DASHBOARD_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const marketingDashboardsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const marketingDashboardObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.marketingDashboard,
  );

  if (!marketingDashboardObjectMetadata) {
    return null;
  }

  return {
    name: 'All Marketing Dashboards',
    objectMetadataId: marketingDashboardObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconChartBar',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          marketingDashboardObjectMetadata.fields.find(
            (field) =>
              field.standardId === MARKETING_DASHBOARD_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
      },
      {
        fieldMetadataId:
          marketingDashboardObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MARKETING_DASHBOARD_STANDARD_FIELD_IDS.description,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
      },
      {
        fieldMetadataId:
          marketingDashboardObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
    ].filter((field) => field.fieldMetadataId !== ''),
  };
};

