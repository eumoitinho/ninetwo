import { createState } from 'ninetwo-ui/utilities';

export const verifyEmailRedirectPathState = createState<string | undefined>({
  key: 'verifyEmailRedirectPathState',
  defaultValue: undefined,
});
