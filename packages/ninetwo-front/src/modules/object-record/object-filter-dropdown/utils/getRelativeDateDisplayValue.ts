import { plural } from 'pluralize';
import {
  type VariableDateViewFilterValueDirection,
  type VariableDateViewFilterValueUnit,
} from 'ninetwo-shared/types';
import { capitalize } from 'ninetwo-shared/utils';

export const getRelativeDateDisplayValue = (
  relativeDate: {
    direction: VariableDateViewFilterValueDirection;
    amount?: number;
    unit: VariableDateViewFilterValueUnit;
  } | null,
) => {
  if (!relativeDate) return '';
  const { direction, amount, unit } = relativeDate;

  const directionStr = capitalize(direction.toLowerCase());
  const amountStr = direction === 'THIS' ? '' : amount;
  const unitStr =
    direction === 'THIS'
      ? unit.toLowerCase()
      : amount
        ? amount > 1
          ? plural(unit.toLowerCase())
          : unit.toLowerCase()
        : undefined;

  return [directionStr, amountStr, unitStr]
    .filter((item) => item !== undefined)
    .join(' ');
};
