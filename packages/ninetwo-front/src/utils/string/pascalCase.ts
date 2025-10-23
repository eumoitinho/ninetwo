import camelCase from 'lodash.camelcase';
import { capitalize } from 'ninetwo-shared/utils';

export const pascalCase = (str: string) => capitalize(camelCase(str));
