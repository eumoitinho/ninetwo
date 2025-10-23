import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { capitalize } from 'ninetwo-shared/utils';

export const getEdgeTypename = (objectNameSingular: string) => {
  return `${capitalize(getObjectTypename(objectNameSingular))}Edge`;
};
