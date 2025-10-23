import { createState } from 'ninetwo-ui/utilities';
import { type AuthToken } from '~/generated/graphql';

export const loginTokenState = createState<AuthToken['token'] | null>({
  key: 'loginTokenState',
  defaultValue: null,
});
