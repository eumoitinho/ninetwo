import { type DomainValidRecords } from '~/generated/graphql';
import { createState } from 'ninetwo-ui/utilities';

export const customDomainRecordsState = createState<{
  customDomainRecords: DomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'customDomainRecordsState',
  defaultValue: { isLoading: false, customDomainRecords: null },
});
