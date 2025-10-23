import { type StepFilter, type StepFilterGroup } from 'ninetwo-shared/types';

export const isStepFilterGroupChildAStepFilterGroup = (
  child: StepFilter | StepFilterGroup,
): child is StepFilterGroup => {
  return ('logicalOperator' satisfies keyof StepFilterGroup) in child;
};
