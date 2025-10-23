import { localStorageEffect } from '~/utils/recoil-effects';
import { createState } from 'ninetwo-ui/utilities';

export const lastVisitedObjectMetadataItemIdState = createState<string | null>({
  key: 'lastVisitedObjectMetadataItemIdState',
  defaultValue: null,
  effects: [localStorageEffect()],
});
