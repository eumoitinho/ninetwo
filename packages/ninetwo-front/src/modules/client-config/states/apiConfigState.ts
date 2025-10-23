import { type ApiConfig } from '~/generated/graphql';
import { createState } from 'ninetwo-ui/utilities';

export const apiConfigState = createState<ApiConfig | null>({
  key: 'apiConfigState',
  defaultValue: null,
});
