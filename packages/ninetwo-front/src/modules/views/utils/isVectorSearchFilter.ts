import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilterOperand } from 'ninetwo-shared/types';

export const isVectorSearchFilter = (filter: RecordFilter) => {
  return filter.operand === ViewFilterOperand.VECTOR_SEARCH;
};
