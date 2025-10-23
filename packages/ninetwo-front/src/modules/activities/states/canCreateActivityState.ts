import { createState } from 'ninetwo-ui/utilities';
export const canCreateActivityState = createState<boolean>({
  key: 'canCreateActivityState',
  defaultValue: false,
});
