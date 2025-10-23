import { RATING_VALUES } from 'ninetwo-shared/constants';
import { type FieldRatingValue } from 'ninetwo-shared/types';

export const isFieldRatingValue = (
  fieldValue: unknown,
): fieldValue is FieldRatingValue =>
  RATING_VALUES.includes(fieldValue as NonNullable<FieldRatingValue>);
