import {
  LoggerDriverType,
  type LoggerModuleOptions,
} from 'src/engine/core-modules/logger/interfaces';
import { type NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

/**
 * Logger Module factory
 * @returns LoggerModuleOptions
 * @param twentyConfigService
 */
export const loggerModuleFactory = async (
  twentyConfigService: NinetwoConfigService,
): Promise<LoggerModuleOptions> => {
  const driverType = twentyConfigService.get('LOGGER_DRIVER');
  const logLevels = twentyConfigService.get('LOG_LEVELS');

  switch (driverType) {
    case LoggerDriverType.CONSOLE: {
      return {
        type: LoggerDriverType.CONSOLE,
        logLevels: logLevels,
      };
    }
    default:
      throw new Error(
        `Invalid logger driver type (${driverType}), check your .env file`,
      );
  }
};
