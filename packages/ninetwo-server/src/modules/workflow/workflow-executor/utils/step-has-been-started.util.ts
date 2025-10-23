import { isDefined } from 'ninetwo-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'ninetwo-shared/workflow';

export const stepHasBeenStarted = (
  stepId: string,
  stepInfos: WorkflowRunStepInfos,
) => {
  return (
    isDefined(stepInfos[stepId]?.status) &&
    stepInfos[stepId].status !== StepStatus.NOT_STARTED
  );
};
