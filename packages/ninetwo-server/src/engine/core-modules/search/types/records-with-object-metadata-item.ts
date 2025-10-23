import { type ObjectRecord } from 'ninetwo-shared/types';

import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export type RecordsWithObjectMetadataItem = {
  objectMetadataItem: ObjectMetadataItemWithFieldMaps;
  records: ObjectRecord[];
};
