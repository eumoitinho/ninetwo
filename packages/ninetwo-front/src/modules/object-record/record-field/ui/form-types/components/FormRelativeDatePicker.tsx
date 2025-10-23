import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';

import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  DEFAULT_RELATIVE_DATE_VALUE,
  type VariableDateViewFilterValue,
} from 'ninetwo-shared/types';
import { safeParseRelativeDateFilterValue } from 'ninetwo-shared/utils';
import { type JsonValue } from 'type-fest';

export type FormRelativeDatePickerProps = {
  label?: string;
  defaultValue?: string;
  onChange: (value: JsonValue) => void;
  readonly?: boolean;
};

export const FormRelativeDatePicker = ({
  defaultValue,
  onChange,
  readonly,
}: FormRelativeDatePickerProps) => {
  const value =
    isString(defaultValue) && isNonEmptyString(defaultValue)
      ? safeParseRelativeDateFilterValue(defaultValue)
      : DEFAULT_RELATIVE_DATE_VALUE;

  const handleValueChange = (newValue: VariableDateViewFilterValue) => {
    onChange(JSON.stringify(newValue));
  };

  return (
    <RelativeDatePickerHeader
      onChange={handleValueChange}
      direction={value?.direction ?? 'THIS'}
      unit={value?.unit ?? 'DAY'}
      amount={value?.amount}
      isFormField={true}
      readonly={readonly}
      unitDropdownWidth={150}
    />
  );
};
