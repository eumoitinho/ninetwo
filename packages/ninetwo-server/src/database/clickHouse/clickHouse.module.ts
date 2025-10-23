import { Module } from '@nestjs/common';

import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';

import { ClickHouseService } from './clickHouse.service';

@Module({
  imports: [NinetwoConfigModule],
  providers: [ClickHouseService],
  exports: [ClickHouseService],
})
export class ClickHouseModule {}
