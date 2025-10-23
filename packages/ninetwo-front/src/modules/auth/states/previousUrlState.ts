import { createState } from 'ninetwo-ui/utilities';
export const previousUrlState = createState<string>({
  key: 'previousUrlState',
  defaultValue: '',
});
