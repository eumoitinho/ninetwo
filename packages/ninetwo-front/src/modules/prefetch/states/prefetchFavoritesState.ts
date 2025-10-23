import { type Favorite } from '@/favorites/types/Favorite';
import { createState } from 'ninetwo-ui/utilities';

export const prefetchFavoritesState = createState<Favorite[]>({
  key: 'prefetchFavoritesState',
  defaultValue: [],
});
