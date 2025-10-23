import { type ViewType } from '@/views/types/ViewType';
import { createState } from 'ninetwo-ui/utilities';

export const recordIndexViewTypeState = createState<ViewType | undefined>({
  key: 'recordIndexViewTypeState',
  defaultValue: undefined,
});
