import { createState } from 'ninetwo-ui/utilities';

export const isEmailingDomainsEnabledState = createState<boolean>({
  key: 'isEmailingDomainsEnabled',
  defaultValue: false,
});
