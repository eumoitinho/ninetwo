import { ConfigurableModuleBuilder } from '@nestjs/common';

import { type NinetwoORMOptions } from './interfaces/ninetwo-orm-options.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<NinetwoORMOptions>().build();
