import { type DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  ConfigVariables,
  validate,
} from 'src/engine/core-modules/ninetwo-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/ninetwo-config/constants/config-variables-instance-tokens.constants';
import { DatabaseConfigModule } from 'src/engine/core-modules/ninetwo-config/drivers/database-config.module';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/ninetwo-config/drivers/environment-config.driver';
import { ConfigurableModuleClass } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module-definition';
import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Global()
@Module({})
export class NinetwoConfigModule extends ConfigurableModuleClass {
  static forRoot(): DynamicModule {
    const isConfigVariablesInDbEnabled =
      process.env.IS_CONFIG_VARIABLES_IN_DB_ENABLED !== 'false';

    const imports = [
      ConfigModule.forRoot({
        isGlobal: true,
        expandVariables: true,
        validate,
        envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      }),
    ];

    if (isConfigVariablesInDbEnabled) {
      imports.push(DatabaseConfigModule.forRoot());
    }

    return {
      module: NinetwoConfigModule,
      imports,
      providers: [
        NinetwoConfigService,
        EnvironmentConfigDriver,
        {
          provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
          useValue: new ConfigVariables(),
        },
      ],
      exports: [NinetwoConfigService],
    };
  }
}
