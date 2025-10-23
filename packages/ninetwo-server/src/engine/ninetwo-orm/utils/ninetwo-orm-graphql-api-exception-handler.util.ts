import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type NinetwoORMException,
  NinetwoORMExceptionCode,
} from 'src/engine/ninetwo-orm/exceptions/ninetwo-orm.exception';

export const twentyORMGraphqlApiExceptionHandler = (
  error: NinetwoORMException,
) => {
  switch (error.code) {
    case NinetwoORMExceptionCode.INVALID_INPUT:
    case NinetwoORMExceptionCode.DUPLICATE_ENTRY_DETECTED:
    case NinetwoORMExceptionCode.CONNECT_RECORD_NOT_FOUND:
    case NinetwoORMExceptionCode.CONNECT_NOT_ALLOWED:
    case NinetwoORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR:
      throw new UserInputError(error.message, {
        userFriendlyMessage: error.userFriendlyMessage,
      });
    default: {
      throw error;
    }
  }
};
