import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { createState } from 'ninetwo-ui/utilities';

export const focusStackState = createState<FocusStackItem[]>({
  key: 'focusStackState',
  defaultValue: [],
});
