import { createState } from 'ninetwo-ui/utilities';

export const appVersionState = createState<string | undefined>({
  key: 'appVersion',
  defaultValue: undefined,
});
