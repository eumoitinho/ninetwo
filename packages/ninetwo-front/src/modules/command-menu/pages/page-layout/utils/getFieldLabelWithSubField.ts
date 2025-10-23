import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { t } from '@lingui/core/macro';
import { type CompositeFieldSubFieldName } from 'ninetwo-shared/types';
import { isDefined } from 'ninetwo-shared/utils';

export const getFieldLabelWithSubField = ({
  field,
  subFieldName,
}: {
  field: FieldMetadataItem | undefined;
  subFieldName?: CompositeFieldSubFieldName;
}): string => {
  const subFieldNameLabel =
    isDefined(subFieldName) && isDefined(field)
      ? getCompositeSubFieldLabel(
          field.type as CompositeFieldType,
          subFieldName,
        )
      : undefined;

  const fieldLabel =
    isDefined(subFieldNameLabel) && isDefined(field?.label)
      ? `${field.label} ${subFieldNameLabel}`
      : isDefined(field?.label)
        ? field.label
        : t`Field`;

  return fieldLabel;
};
