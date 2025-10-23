import { createState } from 'ninetwo-ui/utilities';

export const showHiddenGroupVariablesState = createState<boolean>({
  key: 'showHiddenGroupVariablesState',
  defaultValue: false,
});
