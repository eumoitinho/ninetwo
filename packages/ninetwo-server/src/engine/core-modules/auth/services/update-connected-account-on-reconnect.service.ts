import { Injectable } from '@nestjs/common';

import { type WorkspaceEntityManager } from 'src/engine/ninetwo-orm/entity-manager/workspace-entity-manager';
import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type UpdateConnectedAccountOnReconnectInput = {
  workspaceId: string;
  connectedAccountId: string;
  accessToken: string;
  refreshToken: string;
  scopes: string[];
  connectedAccount: ConnectedAccountWorkspaceEntity;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class UpdateConnectedAccountOnReconnectService {
  constructor(
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
  ) {}

  async updateConnectedAccountOnReconnect(
    input: UpdateConnectedAccountOnReconnectInput,
  ): Promise<void> {
    const {
      workspaceId,
      connectedAccountId,
      accessToken,
      refreshToken,
      scopes,
      manager,
    } = input;

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    await connectedAccountRepository.update(
      {
        id: connectedAccountId,
      },
      {
        accessToken,
        refreshToken,
        scopes,
        authFailedAt: null,
      },
      manager,
    );
  }
}
