import { Module } from '@nestjs/common';

import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';

import { CouchbaseService } from './services/couchbase.service';

@Module({
  imports: [NinetwoConfigModule],
  providers: [CouchbaseService],
  exports: [CouchbaseService],
})
export class CouchbaseModule {}

