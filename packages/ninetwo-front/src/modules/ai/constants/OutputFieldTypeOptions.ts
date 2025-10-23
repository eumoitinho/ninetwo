import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'ninetwo-shared/types';
import {
  IllustrationIconCalendarEvent,
  IllustrationIconNumbers,
  IllustrationIconText,
  IllustrationIconToggle,
} from 'ninetwo-ui/display';

export interface OutputSchemaField {
  id: string;
  name: string;
  description?: string;
  type: InputSchemaPropertyType | undefined;
}

export const OUTPUT_FIELD_TYPE_OPTIONS = [
  {
    label: msg`Text`,
    value: FieldMetadataType.TEXT,
    Icon: IllustrationIconText,
  },
  {
    label: msg`Number`,
    value: FieldMetadataType.NUMBER,
    Icon: IllustrationIconNumbers,
  },
  {
    label: msg`Boolean`,
    value: FieldMetadataType.BOOLEAN,
    Icon: IllustrationIconToggle,
  },
  {
    label: msg`Date`,
    value: FieldMetadataType.DATE,
    Icon: IllustrationIconCalendarEvent,
  },
];
