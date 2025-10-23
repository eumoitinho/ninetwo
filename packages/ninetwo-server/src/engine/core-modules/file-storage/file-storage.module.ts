import { type DynamicModule, Global } from '@nestjs/common';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';

@Global()
export class FileStorageModule {
  static forRoot(): DynamicModule {
    return {
      module: FileStorageModule,
      imports: [NinetwoConfigModule],
      providers: [FileStorageDriverFactory, FileStorageService],
      exports: [FileStorageService],
    };
  }
}
