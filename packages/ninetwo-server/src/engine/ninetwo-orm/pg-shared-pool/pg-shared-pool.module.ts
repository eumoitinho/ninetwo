import {
  Global,
  Logger,
  Module,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';

import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';
import { PgPoolSharedService } from 'src/engine/ninetwo-orm/pg-shared-pool/pg-shared-pool.service';

/**
 * Module that initializes the shared pg pool at application bootstrap
 */
@Global()
@Module({
  imports: [NinetwoConfigModule],
  providers: [PgPoolSharedService],
  exports: [PgPoolSharedService],
})
export class PgPoolSharedModule implements OnModuleInit, OnApplicationShutdown {
  constructor(private readonly pgPoolSharedService: PgPoolSharedService) {}
  private readonly logger = new Logger(PgPoolSharedModule.name);

  /**
   * Initialize the pool sharing service when the module is initialized
   */
  async onModuleInit() {
    await this.pgPoolSharedService.initialize();
  }

  /**
   * Clean up any resources when the application shuts down
   */
  async onApplicationShutdown() {
    this.logger.log('Shutting down PgPoolSharedModule');
    await this.pgPoolSharedService.onApplicationShutdown();
  }
}
