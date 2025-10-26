import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { JobsModule } from 'src/engine/core-modules/message-queue/jobs.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { MarketingModule } from 'src/modules/marketing/marketing.module';

@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([
      Workspace,
      BillingSubscription,
      FeatureFlag,
      KeyValuePair,
      DataSourceEntity,
    ]),
    CoreEngineModule,
    MessageQueueModule.registerExplorer(),
    WorkspaceEventEmitterModule,
    JobsModule,
    NinetwoORMModule,
    MarketingModule,
  ],
})
export class QueueWorkerModule {}
