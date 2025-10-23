import { useParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { isDefined } from 'ninetwo-shared/utils';
import { useIcons } from 'ninetwo-ui/display';

export const useRecordShowPage = (
  propsObjectNameSingular: string,
  propsObjectRecordId: string,
) => {
  const {
    objectNameSingular: paramObjectNameSingular,
    objectRecordId: paramObjectRecordId,
  } = useParams();

  const objectNameSingular = propsObjectNameSingular ?? paramObjectNameSingular;
  const objectRecordId = propsObjectRecordId ?? paramObjectRecordId;

  if (!isDefined(objectNameSingular) || !isDefined(objectRecordId)) {
    throw new Error('Object name or Record id is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { getIcon } = useIcons();
  const headerIcon = getIcon(objectMetadataItem?.icon);

  return {
    objectNameSingular,
    objectRecordId,
    headerIcon,
    objectMetadataItem,
  };
};
