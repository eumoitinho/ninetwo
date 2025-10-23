import { type ObjectsPermissions } from 'ninetwo-shared/types';
import {
  DeleteQueryBuilder,
  type DeleteResult,
  type EntityTarget,
  type InsertQueryBuilder,
  type ObjectLiteral,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { type WhereClause } from 'typeorm/query-builder/WhereClause';

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
import { WorkspaceSelectQueryBuilder } from 'src/engine/ninetwo-orm/repository/workspace-select-query-builder';
import { type WorkspaceSoftDeleteQueryBuilder } from 'src/engine/ninetwo-orm/repository/workspace-soft-delete-query-builder';
import { type WorkspaceUpdateQueryBuilder } from 'src/engine/ninetwo-orm/repository/workspace-update-query-builder';
import { applyTableAliasOnWhereCondition } from 'src/engine/ninetwo-orm/utils/apply-table-alias-on-where-condition';
import { formatResult } from 'src/engine/ninetwo-orm/utils/format-result.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/ninetwo-orm/utils/format-ninetwo-orm-event-to-database-batch-event.util';
import { getObjectMetadataFromEntityTarget } from 'src/engine/ninetwo-orm/utils/get-object-metadata-from-entity-target.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

export class WorkspaceDeleteQueryBuilder<
  T extends ObjectLiteral,
> extends DeleteQueryBuilder<T> {
  private objectRecordsPermissions: ObjectsPermissions;
  private shouldBypassPermissionChecks: boolean;
  private internalContext: WorkspaceInternalContext;
  private authContext?: AuthContext;
  private featureFlagMap?: FeatureFlagMap;
  constructor(
    queryBuilder: DeleteQueryBuilder<T>,
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

    return new WorkspaceDeleteQueryBuilder(
      clonedQueryBuilder,
      this.objectRecordsPermissions,
      this.internalContext,
      this.shouldBypassPermissionChecks,
      this.authContext,
    ) as this;
  }

  override async execute(): Promise<DeleteResult & { generatedMaps: T[] }> {
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

      const eventSelectQueryBuilder = new WorkspaceSelectQueryBuilder(
        this as unknown as WorkspaceSelectQueryBuilder<T>,
        this.objectRecordsPermissions,
        this.internalContext,
        true,
        this.authContext,
        this.featureFlagMap,
      );

      const tableName = computeTableName(
        objectMetadata.nameSingular,
        objectMetadata.isCustom,
      );

      eventSelectQueryBuilder.expressionMap.wheres = this.expressionMap.wheres;

      eventSelectQueryBuilder.expressionMap.aliases =
        this.expressionMap.aliases;
      eventSelectQueryBuilder.setParameters(this.getParameters());

      const before = await eventSelectQueryBuilder.getOne();

      this.expressionMap.wheres = applyTableAliasOnWhereCondition({
        condition: this.expressionMap.wheres,
        tableName,
        aliasName: objectMetadata.nameSingular,
      }) as WhereClause[];

      const result = await super.execute();

      const formattedResult = formatResult<T[]>(
        result.raw,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      const formattedBefore = formatResult<T[]>(
        before,
        objectMetadata,
        this.internalContext.objectMetadataMaps,
      );

      this.internalContext.eventEmitterService.emitDatabaseBatchEvent(
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.DESTROYED,
          objectMetadataItem: objectMetadata,
          workspaceId: this.internalContext.workspaceId,
          entities: formattedBefore,
          authContext: this.authContext,
        }),
      );

      return {
        raw: result.raw,
        generatedMaps: formattedResult,
        affected: result.affected,
      };
    } catch (error) {
      throw computeNinetwoORMException(error);
    }
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

  override select(): WorkspaceSelectQueryBuilder<T> {
    throw new NinetwoORMException(
      'This builder cannot morph into a select builder',
      NinetwoORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override update(): WorkspaceUpdateQueryBuilder<T>;

  override update(
    updateSet: QueryDeepPartialEntity<T>,
  ): WorkspaceUpdateQueryBuilder<T>;

  override update(
    _updateSet?: QueryDeepPartialEntity<T>,
  ): WorkspaceUpdateQueryBuilder<T> {
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

  override softDelete(): WorkspaceSoftDeleteQueryBuilder<T> {
    throw new NinetwoORMException(
      'This builder cannot morph into a soft delete builder',
      NinetwoORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }

  override restore(): WorkspaceSoftDeleteQueryBuilder<T> {
    throw new NinetwoORMException(
      'This builder cannot morph into a soft delete builder',
      NinetwoORMExceptionCode.METHOD_NOT_ALLOWED,
    );
  }
}
