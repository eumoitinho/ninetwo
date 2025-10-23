import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { WorkspaceFeatureFlagsMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.module';
import { WorkspaceMetadataCacheModule } from 'src/engine/metadata-modules/workspace-metadata-cache/workspace-metadata-cache.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { entitySchemaFactories } from 'src/engine/ninetwo-orm/factories';
import { EntitySchemaFactory } from 'src/engine/ninetwo-orm/factories/entity-schema.factory';
import { ScopedWorkspaceContextFactory } from 'src/engine/ninetwo-orm/factories/scoped-workspace-context.factory';
import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { NinetwoORMManager } from 'src/engine/ninetwo-orm/ninetwo-orm.manager';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { PgPoolSharedModule } from './pg-shared-pool/pg-shared-pool.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ObjectMetadataEntity,
      RoleTargetsEntity,
      Workspace,
    ]),
    DataSourceModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataCacheModule,
    PermissionsModule,
    WorkspaceFeatureFlagsMapCacheModule,
    WorkspacePermissionsCacheModule,
    FeatureFlagModule,
    NinetwoConfigModule,
    PgPoolSharedModule,
  ],
  providers: [
    ...entitySchemaFactories,
    NinetwoORMManager,
    NinetwoORMGlobalManager,
  ],
  exports: [
    EntitySchemaFactory,
    NinetwoORMManager,
    NinetwoORMGlobalManager,
    PgPoolSharedModule,
    ScopedWorkspaceContextFactory,
  ],
})
export class NinetwoORMModule {}
