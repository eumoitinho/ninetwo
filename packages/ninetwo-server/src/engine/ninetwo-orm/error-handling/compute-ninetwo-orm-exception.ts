import { msg } from '@lingui/core/macro';
import { isDefined } from 'ninetwo-shared/utils';
import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { handleDuplicateKeyError } from 'src/engine/api/graphql/workspace-query-runner/utils/handle-duplicate-key-error.util';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import {
  NinetwoORMException,
  NinetwoORMExceptionCode,
} from 'src/engine/ninetwo-orm/exceptions/ninetwo-orm.exception';

interface QueryFailedErrorWithCode extends QueryFailedError {
  code?: string;
}

export const computeNinetwoORMException = (
  error: Error,
  objectMetadata?: ObjectMetadataItemWithFieldMaps,
) => {
  if (error instanceof QueryFailedError) {
    if (error.message.includes('Query read timeout')) {
      return new NinetwoORMException(
        'Query read timeout',
        NinetwoORMExceptionCode.QUERY_READ_TIMEOUT,
        {
          userFriendlyMessage: msg`We are experiencing a temporary issue with our database. Please try again later.`,
        },
      );
    }

    if (
      error.message.includes(
        'duplicate key value violates unique constraint',
      ) &&
      isDefined(objectMetadata)
    ) {
      return handleDuplicateKeyError(error, objectMetadata);
    }

    if (error.message.includes('invalid input value for')) {
      return new NinetwoORMException(
        error.message,
        NinetwoORMExceptionCode.INVALID_INPUT,
      );
    }

    const errorCode = (error as QueryFailedErrorWithCode).code;

    if (isDefined(errorCode) && POSTGRESQL_ERROR_CODES.includes(errorCode)) {
      throw new PostgresException(error.message, errorCode);
    }
    throw error;
  }

  return error;
};
