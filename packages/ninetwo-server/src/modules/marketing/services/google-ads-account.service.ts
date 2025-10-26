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

      // Use the CustomerService to list accessible customers
      const accessibleCustomersResponse =
        await googleAdsClient.listAccessibleCustomers(
          connectedAccount.refreshToken,
        );

      const resourceNames = accessibleCustomersResponse.resource_names || [];

      const accountDetails: GoogleAdsAccount[] = [];

      // Get details for each account
      for (const resourceName of resourceNames) {
        try {
          // Extract customer ID from resource name (format: customers/123456789)
          const customerId = resourceName.split('/')[1];

          const customerClient = googleAdsClient.Customer({
            customer_id: customerId,
            refresh_token: connectedAccount.refreshToken,
          });

          const [response] = await customerClient.query(`
            SELECT
              customer.id,
              customer.descriptive_name,
              customer.manager
            FROM customer
            WHERE customer.id = ${customerId}
          `);

          if (response && response.customer) {
            accountDetails.push({
              id: response.customer.id?.toString() || '',
              name: response.customer.descriptive_name || 'Unnamed Account',
              customerId: response.customer.id?.toString() || '',
              isMCC: response.customer.manager || false,
              canManageClients: response.customer.manager || false,
            });
          }
        } catch (accountError) {
          this.logger.warn(
            `Could not fetch details for account from ${resourceName}`,
            accountError,
          );
        }
      }

      return accountDetails;
    } catch (error) {
      this.logger.error('Error listing Google Ads accounts', error);
      throw new Error(`Failed to list Google Ads accounts: ${error.message}`);
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

      const childAccounts: GoogleAdsAccount[] = response
        .filter((row) => row.customer_client != null)
        .map((row) => {
          const client = row.customer_client;

          if (!client) {
            throw new Error('Unexpected null customer_client');
          }

          return {
            id: client.id?.toString() || '',
            name: client.descriptive_name || 'Unnamed Account',
            customerId: client.id?.toString() || '',
            isMCC: client.manager || false,
            canManageClients: false,
          };
        });

      return childAccounts;
    } catch (error) {
      this.logger.error(
        `Error listing MCC child accounts for ${mccCustomerId}`,
        error,
      );
      throw new Error(`Failed to list MCC child accounts: ${error.message}`);
    }
  }
}
