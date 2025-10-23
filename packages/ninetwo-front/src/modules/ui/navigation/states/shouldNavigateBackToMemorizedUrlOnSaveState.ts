import { createState } from 'ninetwo-ui/utilities';

export const shouldNavigateBackToMemorizedUrlOnSaveState = createState<boolean>(
  {
    key: 'shouldNavigateBackToMemorizedUrlOnSaveState',
    defaultValue: false,
  },
);
