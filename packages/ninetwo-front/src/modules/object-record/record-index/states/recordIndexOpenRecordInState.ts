import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { createState } from 'ninetwo-ui/utilities';

export const recordIndexOpenRecordInState = createState<ViewOpenRecordInType>({
  key: 'recordIndexOpenRecordInState',
  defaultValue: ViewOpenRecordInType.SIDE_PANEL,
});
