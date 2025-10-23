import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createState } from 'ninetwo-ui/utilities';

export const objectMetadataItemsState = createState<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsState',
  defaultValue: [],
});
