import { type ObjectsPermissions } from 'ninetwo-shared/types';
import {
  type EntityTarget,
  type InsertQueryBuilder,
  type ObjectLiteral,
  type UpdateResult,
} from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/ninetwo-orm/interfaces/workspace-internal-context.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { computeNinetwoORMException } from 'src/engine/ninetwo-orm/error-handling/compute-ninetwo-orm-exception';
import {
  NinetwoORMException,
  NinetwoORMExceptionCode,
} from 'src/engine/ninetwo-orm/exceptions/ninetwo-orm.exception';
import { validateQueryIsPermittedOrThrow } from 'src/engine/ninetwo-orm/repository/permissions.utils';
import { type WorkspaceDeleteQueryBuilder } from 'src/engine/ninetwo-orm/repository/workspace-delete-query-builder';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/ninetwo-orm/repository/workspace-select-query-builder';
import { type WorkspaceUpdateQueryBuilder } from 'src/engine/ninetwo-orm/repository/workspace-update-query-builder';
import { formatResult } from 'src/engine/ninetwo-orm/utils/format-result.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/ninetwo-orm/utils/format-ninetwo-orm-event-to-database-batch-event.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/ninetwo-orm/utils/get-object-metadata-from-entity-target.util';

export class WorkspaceSoftDeleteQueryBuilder<
  T extends ObjectLiteral,
> extends SoftDeleteQueryBuilder<T> {
  private objectRecordsPermissions: ObjectsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  private authContext?: AuthContext;
  private featureFlagMap?: FeatureFlagMap;

  constructor(
    queryBuilder: SoftDeleteQueryBuilder<T>,
    objectRecordsPermissions: ObjectsPermissions,
    internalContext: WorkspaceInternalContext,
    shouldBypassPermissionChecks: boolean,
    authContext?: AuthContext,
    featureFlagMap?: FeatureFlagMap,
  ) {
    super(queryBuilder);
    this.objectRecordsPermissions = objectRecordsPermissions;
    this.internalContext = internalContext;
    this.shouldBypassPermissionChecks = shouldBypassPermissionChecks;
    this.authContext = authContext;
    this.featureFlagMap = featureFlagMap;
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    return new WorkspaceSoftDeleteQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
    ) as this;
  }

  override async execute(): Promise<UpdateResult> {
    try {
      validateQueryIsPermittedOrThrow({
        expressionMap: this.expressionMap,
        objectsPermissions: this.objectRecordsPermissions,
        objectMetadataMaps: this.internalContext.objectMetadataMaps,
        shouldBypassPermissionChecks: this.shouldBypassPermissionChecks,
      });

      const mainAliasTarget = this.getMainAliasTarget();

      const objectMetadata = getObjectMetadataFromEntityTarget(
        mainAliasTarget,
        this.internalContext,
      );

      const after = await super.execute();

      const formattedAfter = formatResult<T[]>(
        after.raw,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.DELETED,
          objectMetadataItem: objectMetadata,
          workspaceId: this.internalContext.workspaceId,
          entities: formattedAfter,
          authContext: this.authContext,
        }),
      );

      return {
        raw: after.raw,
        generatedMaps: formattedAfter,
        affected: after.affected,
      };
    } catch (error) {
      throw computeNinetwoORMException(error);
    }
  }

  override select(): WorkspaceSelectQueryBuilder<T> {
    throw new NinetwoORMException(
      'This builder cannot morph into a select builder',
      NinetwoORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override update(): WorkspaceUpdateQueryBuilder<T> {
    throw new NinetwoORMException(
      'This builder cannot morph into an update builder',
      NinetwoORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override insert(): InsertQueryBuilder<T> {
    throw new NinetwoORMException(
      'This builder cannot morph into an insert builder',
      NinetwoORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override delete(): WorkspaceDeleteQueryBuilder<T> {
    throw new NinetwoORMException(
      'This builder cannot morph into a delete builder',
      NinetwoORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  private getMainAliasTarget(): EntityTarget<T> {
    const mainAliasTarget = this.expressionMap.mainAlias?.target;

    if (!mainAliasTarget) {
      throw new NinetwoORMException(
        'Main alias target is missing',
        NinetwoORMExceptionCode.MISSING_MAIN_ALIAS_TARGET,
      );
    }

    return mainAliasTarget;
  }
}
