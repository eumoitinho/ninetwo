import { msg } from '@lingui/core/macro';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import {
  ANALYTICS_DATA_STANDARD_FIELD_IDS,
  BASE_OBJECT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const analyticsDataAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const analyticsDataObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.analyticsData,
  );

  if (!analyticsDataObjectMetadata) {
    return null;
  }

  return {
    name: 'All Analytics Data',
    objectMetadataId: analyticsDataObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconChartLine',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          analyticsDataObjectMetadata.fields.find(
            (field) => field.standardId === ANALYTICS_DATA_STANDARD_FIELD_IDS.date,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          analyticsDataObjectMetadata.fields.find(
            (field) =>
              field.standardId === ANALYTICS_DATA_STANDARD_FIELD_IDS.propertyId,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
      },
      {
        fieldMetadataId:
          analyticsDataObjectMetadata.fields.find(
            (field) =>
              field.standardId === ANALYTICS_DATA_STANDARD_FIELD_IDS.sessions,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          analyticsDataObjectMetadata.fields.find(
            (field) =>
              field.standardId === ANALYTICS_DATA_STANDARD_FIELD_IDS.totalUsers,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          analyticsDataObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              ANALYTICS_DATA_STANDARD_FIELD_IDS.sessionSource,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
      },
      {
        fieldMetadataId:
          analyticsDataObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
    ].filter((field) => field.fieldMetadataId !== ''),
  };
};

