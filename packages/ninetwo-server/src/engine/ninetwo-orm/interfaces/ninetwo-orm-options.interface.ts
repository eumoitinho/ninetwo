import { type FactoryProvider, type ModuleMetadata } from '@nestjs/common';

export interface NinetwoORMOptions {
  [key: string]: unknown;
}

export type NinetwoORMModuleAsyncOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => NinetwoORMOptions | Promise<NinetwoORMOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
