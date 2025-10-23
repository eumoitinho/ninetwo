import { createState } from 'ninetwo-ui/utilities';

export const recordIndexCalendarFieldMetadataIdState = createState<
  string | null
>({
  key: 'recordIndexCalendarFieldMetadataIdState',
  defaultValue: null,
});
