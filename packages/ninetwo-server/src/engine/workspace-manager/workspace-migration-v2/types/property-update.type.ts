import { type FromTo } from 'ninetwo-shared/types';

export type PropertyUpdate<T, P extends keyof T> = {
  property: P;
} & FromTo<T[P]>;
