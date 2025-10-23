import { type ObjectRecordGroupByDateGranularity } from 'ninetwo-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type GroupByRegularField = {
  fieldMetadata: FieldMetadataEntity;
  subFieldName?: string;
};
export type GroupByDateField = {
  fieldMetadata: FieldMetadataEntity;
  subFieldName?: string;
  dateGranularity: ObjectRecordGroupByDateGranularity;
};
export type GroupByField = GroupByRegularField | GroupByDateField;
