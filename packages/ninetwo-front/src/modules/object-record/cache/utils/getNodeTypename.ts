import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { capitalize } from 'ninetwo-shared/utils';

export const getNodeTypename = (objectNameSingular: string) => {
  return capitalize(getObjectTypename(objectNameSingular));
};
