import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { createState } from 'ninetwo-ui/utilities';

export const coreViewsState = createState<CoreViewWithRelations[]>({
  key: 'coreViewsState',
  defaultValue: [],
});
