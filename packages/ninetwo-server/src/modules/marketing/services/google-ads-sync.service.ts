import { Injectable, Logger } from '@nestjs/common';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  AdAccountDto,
  AdAccountsResultDto,
} from 'src/modules/marketing/dtos/ad-account.dto';
import {
  MarketingCampaignDto,
  MarketingMetricDto,
} from 'src/modules/marketing/dtos/campaign.dto';
import { DateRangeInput } from 'src/modules/marketing/dtos/date-range.input';

@Injectable()
export class GoogleAdsSyncService {
  private readonly logger = new Logger(GoogleAdsSyncService.name);

  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async fetchAccessibleCustomers(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ): Promise<AdAccountsResultDto> {
    this.logger.log('Starting fetchAccessibleCustomers...');

    try {
      if (!connectedAccount.refreshToken) {
        throw new Error('No refresh token available for Google Ads');
      }

      const googleAdsClient =
        await this.oAuth2ClientManagerService.getGoogleAdsOAuth2Client(
          connectedAccount,
        );

      this.logger.log(
        'Google Ads client created, fetching accessible customers...',
      );

      // Get accessible customers first using the client directly
      const accessibleCustomersResponse =
        await googleAdsClient.listAccessibleCustomers(
          connectedAccount.refreshToken,
        );

      const resourceNames = accessibleCustomersResponse.resource_names || [];

      this.logger.log(`Found ${resourceNames.length} accessible customers`);

      if (resourceNames.length === 0) {
        this.logger.warn(
          'No accessible customers found for this Google Ads account',
        );

        return {
          accounts: [],
          selectedAccounts: [],
          managerCustomerId: undefined,
          managerAccountId: undefined,
        };
      }

      // Extract customer IDs from resource names
      const customerIds = resourceNames.map(
        (resourceName) => resourceName.split('/')[1],
      );

      // Try to detect if any is an MCC account
      let managerCustomerId: string | undefined;
      let childAccounts: AdAccountDto[] = [];

      // Check each accessible customer to see if it's a manager account
      for (const customerId of customerIds) {
        if (!customerId) {
          continue;
        }

        try {
          this.logger.log(
            `Checking if customer ${customerId} is an MCC account...`,
          );

          const customer = googleAdsClient.Customer({
            customer_id: customerId,
            refresh_token: connectedAccount.refreshToken,
            login_customer_id: customerId, // Use as login customer for MCC detection
          });

          // First, check if this customer is a manager account
          const managerCheck = await customer.query(`
            SELECT
              customer.manager,
              customer.descriptive_name,
              customer.currency_code,
              customer.time_zone
            FROM customer
            LIMIT 1
          `);

          if (managerCheck && managerCheck.length > 0) {
            const customerData = managerCheck[0].customer;
            const isManager = customerData?.manager;
            const descriptiveName = customerData?.descriptive_name;

            this.logger.log(
              `Customer ${customerId} - Manager: ${isManager}, Name: ${descriptiveName}`,
            );

            if (isManager) {
              // This is an MCC account, try to get child accounts
              try {
                const childResult = await customer.query(`
                  SELECT
                    customer_client.id,
                    customer_client.descriptive_name,
                    customer_client.currency_code,
                    customer_client.time_zone,
                    customer_client.manager
                  FROM customer_client
                  WHERE customer_client.status = 'ENABLED'
                  ORDER BY customer_client.descriptive_name
                `);

                if (childResult && childResult.length > 0) {
                  // This is an MCC account with child accounts
                  managerCustomerId = customerId;

                  childAccounts = childResult
                    .filter((row) => row.customer_client != null)
                    .map((row) => {
                      const client = row.customer_client;

                      if (!client) {
                        throw new Error('Unexpected null customer_client');
                      }

                      return {
                        id: client.id?.toString() || '',
                        name:
                          client.descriptive_name ||
                          `Account ${client.id?.toString() || ''}`,
                        currency: client.currency_code || undefined,
                        timezone: client.time_zone || undefined,
                        type: 'ads' as string,
                        platform: 'google' as string,
                      } as AdAccountDto;
                    });

                  this.logger.log(
                    `Detected MCC account ${customerId} with ${childAccounts.length} child accounts`,
                  );
                  break; // Found MCC, no need to check others
                } else {
                  this.logger.log(
                    `MCC account ${customerId} has no accessible child accounts`,
                  );
                }
              } catch (childError) {
                this.logger.warn(
                  `Could not fetch child accounts for MCC ${customerId}`,
                  childError,
                );
              }
            }
          }
        } catch (mccError) {
          // Not an MCC account or no access
          this.logger.debug(
            `Customer ${customerId} is not an MCC or has no accessible data`,
            mccError,
          );
        }
      }

      // If no MCC was found, return the accessible customers as regular accounts
      if (!managerCustomerId) {
        this.logger.log('No MCC detected, fetching regular accounts...');

        const regularAccounts = await Promise.all(
          customerIds.map(async (customerId) => {
            if (!customerId) {
              return null;
            }

            try {
              const customer = googleAdsClient.Customer({
                customer_id: customerId,
                refresh_token: connectedAccount.refreshToken,
              });

              const accountInfo = await customer.query(`
                SELECT
                  customer.id,
                  customer.descriptive_name,
                  customer.currency_code,
                  customer.time_zone
                FROM customer
                LIMIT 1
              `);

              if (accountInfo && accountInfo.length > 0 && accountInfo[0].customer) {
                const customerData = accountInfo[0].customer;

                return {
                  id: customerData.id?.toString() || customerId,
                  name:
                    customerData.descriptive_name ||
                    `Account ${customerData.id?.toString() || customerId}`,
                  currency: customerData.currency_code || undefined,
                  timezone: customerData.time_zone || undefined,
                  type: 'ads' as string,
                  platform: 'google' as string,
                } as AdAccountDto;
              }
            } catch (error) {
              this.logger.warn(
                `Could not fetch details for customer ${customerId}`,
                error,
              );
            }

            return null;
          }),
        );

        const accounts = regularAccounts.filter((a) => a !== null) as AdAccountDto[];

        this.logger.log(
          `Found ${accounts.length} regular Google Ads accounts`,
        );

        return {
          accounts,
          selectedAccounts: [],
          managerCustomerId: undefined,
          managerAccountId: undefined,
        };
      }

      // Return MCC child accounts
      this.logger.log(
        `Returning ${childAccounts.length} MCC child accounts`,
      );

      return {
        accounts: childAccounts,
        selectedAccounts: [],
        managerCustomerId,
        managerAccountId: managerCustomerId,
      };
    } catch (error) {
      this.logger.error('Failed to fetch Google Ads accounts', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new Error(`Failed to fetch Google Ads accounts: ${errorMessage}`);
    }
  }

  async fetchCampaigns(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    customerId: string,
    managerCustomerId?: string,
  ): Promise<MarketingCampaignDto[]> {
    try {
      this.logger.log(`Fetching campaigns for customer ${customerId}`);

      const googleAdsClient =
        await this.oAuth2ClientManagerService.getGoogleAdsOAuth2Client(
          connectedAccount,
        );

      const customer = googleAdsClient.Customer({
        customer_id: customerId,
        login_customer_id: managerCustomerId || customerId,
        refresh_token: connectedAccount.refreshToken,
      });

      this.logger.log('Querying Google Ads API for campaigns...');

      const campaigns = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.bidding_strategy_type,
          campaign.start_date,
          campaign.end_date,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `);

      this.logger.log(`Found ${campaigns.length} campaigns`);

      return campaigns.map((row: unknown) => {
        const typedRow = row as {
          campaign: {
            id: string;
            name: string;
            status: string;
            advertising_channel_type?: string;
            bidding_strategy_type?: string;
            start_date?: string;
            end_date?: string;
          };
          metrics?: {
            impressions?: string;
            clicks?: string;
            cost_micros?: string;
            conversions?: string;
            conversions_value?: string;
          };
        };

        return {
          id: typedRow.campaign.id.toString(),
          name: typedRow.campaign.name || 'Unnamed Campaign',
          status: typedRow.campaign.status,
          type: typedRow.campaign.advertising_channel_type || 'UNKNOWN',
          impressions: parseInt(typedRow.metrics?.impressions || '0'),
          clicks: parseInt(typedRow.metrics?.clicks || '0'),
          cost: parseFloat(typedRow.metrics?.cost_micros || '0') / 1000000,
          conversions: parseFloat(typedRow.metrics?.conversions || '0'),
          conversionValue: parseFloat(
            typedRow.metrics?.conversions_value || '0',
          ),
          customerId,
          startDate: typedRow.campaign.start_date,
          endDate: typedRow.campaign.end_date,
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch campaigns from Google Ads for customer ${customerId}`,
      );
      this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);

      if (error instanceof Error) {
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }

      throw error;
    }
  }

  async fetchMetrics(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    customerId: string,
    campaignIds: string[],
    dateRange: DateRangeInput,
    managerCustomerId?: string,
  ): Promise<MarketingMetricDto[]> {
    try {
      this.logger.log(
        `Querying Google Ads API for customer ${customerId} with ${campaignIds.length} campaigns from ${dateRange.startDate} to ${dateRange.endDate}`,
      );

      const googleAdsClient =
        await this.oAuth2ClientManagerService.getGoogleAdsOAuth2Client(
          connectedAccount,
        );

      const customer = googleAdsClient.Customer({
        customer_id: customerId,
        login_customer_id: managerCustomerId || customerId,
        refresh_token: connectedAccount.refreshToken,
      });

      // Build campaign ID filter using IN clause
      const campaignIdsList = campaignIds.join(', ');

      const metrics = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          segments.date,
          segments.device,
          segments.ad_network_type,
          customer.currency_code,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.conversions_value,
          metrics.cost_micros,
          metrics.average_cpc,
          metrics.average_cpm,
          metrics.ctr,
          metrics.interactions,
          metrics.all_conversions,
          metrics.all_conversions_value,
          metrics.view_through_conversions
        FROM campaign
        WHERE campaign.id IN (${campaignIdsList})
          AND segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
        ORDER BY segments.date DESC
        LIMIT 10000
      `);

      this.logger.log(
        `Retrieved ${metrics.length} metric rows for customer ${customerId}`,
      );

      return metrics.map((row: unknown) => {
        const typedRow = row as {
          campaign: { id: string; name: string };
          customer: { currency_code: string };
          segments: {
            date: string;
            device?: string;
            ad_network_type?: string;
          };
          metrics: {
            impressions?: string;
            clicks?: string;
            conversions?: string;
            conversions_value?: string;
            cost_micros?: string;
            average_cpc?: string;
            average_cpm?: string;
            ctr?: string;
            interactions?: string;
            all_conversions?: string;
            all_conversions_value?: string;
            view_through_conversions?: string;
          };
        };

        const costMicros = parseInt(typedRow.metrics.cost_micros || '0');
        const clicks = parseInt(typedRow.metrics.clicks || '0');
        const conversions = parseFloat(typedRow.metrics.conversions || '0');
        const conversionsValue = parseFloat(
          typedRow.metrics.conversions_value || '0',
        );

        return {
          campaignId: typedRow.campaign.id.toString(),
          campaignName: typedRow.campaign.name,
          date: typedRow.segments.date,
          impressions: parseInt(typedRow.metrics.impressions || '0'),
          clicks,
          cost: costMicros / 1000000,
          conversions,
          conversionValue: conversionsValue,
          ctr: parseFloat(typedRow.metrics.ctr || '0'),
          averageCpc: parseFloat(typedRow.metrics.average_cpc || '0') / 1000000,
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch metrics from Google Ads for customer ${customerId}`,
      );

      // Log detailed error information
      if (error && typeof error === 'object') {
        try {
          const errorObj = error as Record<string, unknown>;

          if (errorObj.errors && Array.isArray(errorObj.errors)) {
            errorObj.errors.forEach((err: unknown, idx: number) => {
              this.logger.error(
                `Error ${idx + 1}:`,
                JSON.stringify(err, null, 2),
              );
            });
          } else {
            this.logger.error(
              `Full error object:`,
              JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
            );
          }
        } catch {
          this.logger.error(`Error stringifying failed, raw error:`, error);
        }
      }

      throw error;
    }
  }
}
