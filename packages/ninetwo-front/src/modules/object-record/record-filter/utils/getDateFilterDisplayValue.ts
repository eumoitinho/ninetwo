import { type FilterableAndTSVectorFieldType } from 'ninetwo-shared/types';

export const getDateFilterDisplayValue = (
  value: Date,
  fieldType: FilterableAndTSVectorFieldType,
) => {
  const displayValue =
    fieldType === 'DATE_TIME'
      ? value.toLocaleString()
      : value.toLocaleDateString();

  return { displayValue };
};
