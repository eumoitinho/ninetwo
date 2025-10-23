import { Injectable, Logger } from '@nestjs/common';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

import { type AdAccountsResult } from 'ninetwo-marketing-core';

@Injectable()
export class GoogleAnalyticsSyncService {
  private readonly logger = new Logger(GoogleAnalyticsSyncService.name);

  async fetchProperties(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'syncConfig'
    >,
  ): Promise<AdAccountsResult> {
    this.logger.log('Fetching Google Analytics properties...');

    // TODO: Implementar integração real com Google Analytics Data API
    // Por enquanto, retornar dados mock para permitir configuração

    return {
      accounts: [
        {
          id: 'properties/123456789',
          name: 'Example GA4 Property',
          type: 'REGULAR',
          platform: 'google-analytics',
          currencyCode: 'USD',
        },
      ],
    };
  }
}


