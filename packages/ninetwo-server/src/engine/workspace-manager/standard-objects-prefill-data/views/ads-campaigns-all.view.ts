import { msg } from '@lingui/core/macro';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import {
    ADS_CAMPAIGN_STANDARD_FIELD_IDS,
    BASE_OBJECT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const adsCampaignsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
  useCoreNaming = false,
) => {
  const adsCampaignObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.adsCampaign,
  );

  if (!adsCampaignObjectMetadata) {
    return null;
  }

  return {
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Campaigns',
    objectMetadataId: adsCampaignObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconTargetArrow',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          adsCampaignObjectMetadata.fields.find(
            (field) => field.standardId === ADS_CAMPAIGN_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
      },
      {
        fieldMetadataId:
          adsCampaignObjectMetadata.fields.find(
            (field) =>
              field.standardId === ADS_CAMPAIGN_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          adsCampaignObjectMetadata.fields.find(
            (field) =>
              field.standardId === ADS_CAMPAIGN_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          adsCampaignObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
    ],
  };
};

