import { Injectable, Logger } from '@nestjs/common';


import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type GoogleAdsAccount = {
  id: string;
  name: string;
  customerId: string;
  isMCC: boolean;
  canManageClients: boolean;
};

@Injectable()
export class GoogleAdsAccountService {
  private readonly logger = new Logger(GoogleAdsAccountService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async listAccessibleAccounts(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<GoogleAdsAccount[]> {
    try {
      const googleAdsClient =
        await this.oAuth2ClientManagerService.getGoogleAdsOAuth2Client(
          connectedAccount,
        );

      // Get customer clients (accounts accessible to this user)
      const customer = googleAdsClient.Customer({
        customer_id: 'me',
        refresh_token: connectedAccount.refreshToken,
      });

      const accounts = await customer.listAccessibleCustomers();

      const accountDetails: GoogleAdsAccount[] = [];

      // Get details for each account
      for (const customerId of accounts) {
        try {
          const customerClient = googleAdsClient.Customer({
            customer_id: customerId.replace(/-/g, ''),
            refresh_token: connectedAccount.refreshToken,
          });

          const [response] = await customerClient.query(`
            SELECT
              customer.id,
              customer.descriptive_name,
              customer.manager,
              customer.can_manage_clients
            FROM customer
            WHERE customer.id = ${customerId.replace(/-/g, '')}
          `);

          if (response) {
            accountDetails.push({
              id: response.customer.id.toString(),
              name: response.customer.descriptive_name || 'Unnamed Account',
              customerId: response.customer.id.toString(),
              isMCC: response.customer.manager || false,
              canManageClients: response.customer.can_manage_clients || false,
            });
          }
        } catch (accountError) {
          this.logger.warn(
            `Could not fetch details for account ${customerId}`,
            accountError,
          );
        }
      }

      return accountDetails;
    } catch (error) {
      this.logger.error('Error listing Google Ads accounts', error);
      throw new Error(
        `Failed to list Google Ads accounts: ${error.message}`,
      );
    }
  }

  async getMCCChildAccounts(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    mccCustomerId: string,
  ): Promise<GoogleAdsAccount[]> {
    try {
      const googleAdsClient =
        await this.oAuth2ClientManagerService.getGoogleAdsOAuth2Client(
          connectedAccount,
        );

      const mccCustomer = googleAdsClient.Customer({
        customer_id: mccCustomerId.replace(/-/g, ''),
        refresh_token: connectedAccount.refreshToken,
      });

      const response = await mccCustomer.query(`
        SELECT
          customer_client.id,
          customer_client.descriptive_name,
          customer_client.manager,
          customer_client.status
        FROM customer_client
        WHERE customer_client.status = 'ENABLED'
      `);

      const childAccounts: GoogleAdsAccount[] = response.map((row: any) => ({
        id: row.customer_client.id.toString(),
        name:
          row.customer_client.descriptive_name || 'Unnamed Account',
        customerId: row.customer_client.id.toString(),
        isMCC: row.customer_client.manager || false,
        canManageClients: false,
      }));

      return childAccounts;
    } catch (error) {
      this.logger.error(
        `Error listing MCC child accounts for ${mccCustomerId}`,
        error,
      );
      throw new Error(
        `Failed to list MCC child accounts: ${error.message}`,
      );
    }
  }
}

