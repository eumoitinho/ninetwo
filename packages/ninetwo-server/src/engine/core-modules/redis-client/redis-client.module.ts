import { Global, Module } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';

@Global()
@Module({
  imports: [NinetwoConfigModule],
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
