import { type Sentry } from '~/generated/graphql';
import { createState } from 'ninetwo-ui/utilities';

export const sentryConfigState = createState<Sentry | null>({
  key: 'sentryConfigState',
  defaultValue: null,
});
