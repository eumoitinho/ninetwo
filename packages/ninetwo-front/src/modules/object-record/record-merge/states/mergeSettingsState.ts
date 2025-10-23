import { type MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import { createState } from 'ninetwo-ui/utilities';

export const mergeSettingsState = createState<MergeManySettings>({
  key: 'mergeSettingsState',
  defaultValue: {
    conflictPriorityIndex: 0,
  },
});
