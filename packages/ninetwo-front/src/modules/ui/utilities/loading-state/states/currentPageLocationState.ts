import { createState } from 'ninetwo-ui/utilities';
export const currentPageLocationState = createState<string>({
  key: 'currentPageLocationState',
  defaultValue: '',
});
