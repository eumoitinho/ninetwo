import { type ObjectRecord } from 'ninetwo-shared/types';

export type PartialObjectRecordWithId = Partial<ObjectRecord> & { id: string };
