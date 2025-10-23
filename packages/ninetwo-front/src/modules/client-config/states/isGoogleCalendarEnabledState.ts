import { createState } from 'ninetwo-ui/utilities';
export const isGoogleCalendarEnabledState = createState<boolean>({
  key: 'isGoogleCalendarEnabled',
  defaultValue: false,
});
