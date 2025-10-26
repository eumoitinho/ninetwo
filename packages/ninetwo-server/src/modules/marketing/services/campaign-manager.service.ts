import { Injectable } from '@nestjs/common';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CampaignManagerService {
  async pauseCampaign(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    customerId: string,
    campaignId: string,
    managerCustomerId?: string,
  ): Promise<boolean> {
    // TODO: Implement campaign pause functionality
    throw new Error('Campaign pause not implemented yet');
  }

  async activateCampaign(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    customerId: string,
    campaignId: string,
    managerCustomerId?: string,
  ): Promise<boolean> {
    // TODO: Implement campaign activation functionality
    throw new Error('Campaign activation not implemented yet');
  }
}