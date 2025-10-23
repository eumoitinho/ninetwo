import { createState } from 'ninetwo-ui/utilities';
export const isPersistingViewFieldsState = createState<boolean>({
  key: 'isPersistingViewFieldsState',
  defaultValue: false,
});
