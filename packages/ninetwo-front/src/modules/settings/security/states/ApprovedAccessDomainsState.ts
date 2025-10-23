import { type ApprovedAccessDomain } from '~/generated/graphql';
import { createState } from 'ninetwo-ui/utilities';

export const approvedAccessDomainsState = createState<
  Omit<ApprovedAccessDomain, '__typename'>[]
>({
  key: 'ApprovedAccessDomainsState',
  defaultValue: [],
});
