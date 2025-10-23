import { type jsonRelationFilterValueSchema } from 'ninetwo-shared/utils';
import { type z } from 'zod';

export type RelationFilterValue = z.infer<typeof jsonRelationFilterValueSchema>;
