/* @license Enterprise */

import { type SSOIdentityProvider } from '@/settings/security/types/SSOIdentityProvider';
import { createState } from 'ninetwo-ui/utilities';

export const SSOIdentitiesProvidersState = createState<
  Omit<SSOIdentityProvider, '__typename'>[]
>({
  key: 'SSOIdentitiesProvidersState',
  defaultValue: [],
});
