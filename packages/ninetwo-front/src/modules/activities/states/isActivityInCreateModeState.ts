import { createState } from 'ninetwo-ui/utilities';
export const isActivityInCreateModeState = createState<boolean>({
  key: 'isActivityInCreateModeState',
  defaultValue: false,
});
