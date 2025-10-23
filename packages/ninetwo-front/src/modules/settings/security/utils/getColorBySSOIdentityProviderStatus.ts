import { type SsoIdentityProviderStatus } from '~/generated/graphql';
import { type ThemeColor } from 'ninetwo-ui/theme';

export const getColorBySSOIdentityProviderStatus: Record<
  SsoIdentityProviderStatus,
  ThemeColor
> = {
  Active: 'green',
  Inactive: 'gray',
  Error: 'red',
};
