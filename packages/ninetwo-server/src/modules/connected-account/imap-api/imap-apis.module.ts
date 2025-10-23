import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { ImapSmtpCalDavAPIService } from 'src/modules/connected-account/services/imap-smtp-caldav-apis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity]),
    MessageQueueModule,
    WorkspaceEventEmitterModule,
    NinetwoConfigModule,
    NinetwoORMModule,
    FeatureFlagModule,
    AuthModule,
  ],
  providers: [ImapSmtpCalDavAPIService],
  exports: [ImapSmtpCalDavAPIService],
})
export class IMAPAPIsModule {}
