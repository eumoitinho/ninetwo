import { type PublicWorkspaceDataOutput } from '~/generated/graphql';
import { createState } from 'ninetwo-ui/utilities';

export const workspacePublicDataState =
  createState<PublicWorkspaceDataOutput | null>({
    key: 'workspacePublicDataState',
    defaultValue: null,
  });
