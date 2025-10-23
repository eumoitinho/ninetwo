import {
  type EntitySchema,
  type EntityTarget,
  type ObjectLiteral,
} from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/ninetwo-orm/interfaces/workspace-internal-context.interface';

import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import {
  NinetwoORMException,
  NinetwoORMExceptionCode,
} from 'src/engine/ninetwo-orm/exceptions/ninetwo-orm.exception';
import { WorkspaceEntitiesStorage } from 'src/engine/ninetwo-orm/storage/workspace-entities.storage';

export const getObjectMetadataFromEntityTarget = <T extends ObjectLiteral>(
  entityTarget: EntityTarget<T>,
  internalContext: WorkspaceInternalContext,
): ObjectMetadataItemWithFieldMaps => {
  const objectMetadataName =
    typeof entityTarget === 'string'
      ? entityTarget
      : WorkspaceEntitiesStorage.getObjectMetadataName(
          internalContext.workspaceId,
          entityTarget as EntitySchema,
        );

  if (!objectMetadataName) {
    throw new NinetwoORMException(
      'Object metadata name is missing',
      NinetwoORMExceptionCode.MALFORMED_METADATA,
    );
  }

  const objectMetadata = getObjectMetadataMapItemByNameSingular(
    internalContext.objectMetadataMaps,
    objectMetadataName,
  );

  if (!objectMetadata) {
    throw new NinetwoORMException(
      `Object metadata for object "${objectMetadataName}" is missing ` +
        `in workspace "${internalContext.workspaceId}" ` +
        `with object metadata collection length: ${
          Object.keys(internalContext.objectMetadataMaps.idByNameSingular)
            .length
        }`,
      NinetwoORMExceptionCode.MALFORMED_METADATA,
    );
  }

  return objectMetadata;
};
