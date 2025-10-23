import { createState } from 'ninetwo-ui/utilities';
export const isAppWaitingForFreshObjectMetadataState = createState<boolean>({
  key: 'isAppWaitingForFreshObjectMetadataState',
  defaultValue: false,
});
