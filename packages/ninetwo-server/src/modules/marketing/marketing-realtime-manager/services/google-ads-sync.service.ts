import { Injectable, Logger } from '@nestjs/common';

import { Customer } from 'google-ads-api';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

import {
    type AdAccount,
    type AdAccountsResult,
    type Campaign,
    type CampaignMetrics,
    type CampaignStatus,
    type DateRange,
    type MoneyAmount,
} from 'ninetwo-marketing-core';

@Injectable()
export class GoogleAdsSyncService {
  private readonly logger = new Logger(GoogleAdsSyncService.name);

  constructor(
    private readonly oauth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  async fetchAccessibleCustomers(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'syncConfig'
    >,
  ): Promise<AdAccountsResult> {
    this.logger.log('Fetching accessible Google Ads customers...');

    try {
      const googleAdsClient =
        await this.oauth2ClientManagerService.getGoogleAdsOAuth2Client(
          connectedAccount,
        );

      const response = await googleAdsClient.listAccessibleCustomers(
        connectedAccount.refreshToken,
      );

      if (!response || !response.resource_names) {
        this.logger.warn('No accessible customers found');

        return { accounts: [] };
      }

      const customerIds = response.resource_names
        .map((name: string) => {
          const match = name.match(/customers\/(\d+)/);

          return match ? match[1] : null;
        })
        .filter((id: string | null): id is string => id !== null);

      this.logger.log(`Found ${customerIds.length} accessible customers`);

      // Check for MCC accounts
      let managerCustomerId: string | undefined;
      let childAccounts: AdAccount[] = [];

      for (const customerId of customerIds) {
        try {
          const customer: Customer = googleAdsClient.Customer({
            customer_id: customerId,
            refresh_token: connectedAccount.refreshToken,
            login_customer_id: customerId,
          });

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
            const isManager = managerCheck[0]?.customer?.manager;

            if (isManager) {
              // Fetch child accounts
              const childResult = await customer.query(`
                SELECT
                  customer_client.id,
                  customer_client.descriptive_name,
                  customer_client.currency_code,
                  customer_client.time_zone
                FROM customer_client
                WHERE customer_client.manager = FALSE
                ORDER BY customer_client.descriptive_name
              `);

              if (childResult && childResult.length > 0) {
                managerCustomerId = customerId;
                childAccounts = childResult.map((row: unknown) => {
                  const typedRow = row as {
                    customer_client: {
                      id: string;
                      descriptive_name?: string;
                      currency_code?: string;
                      time_zone?: string;
                    };
                  };

                  return {
                    id: String(typedRow.customer_client.id),
                    name:
                      typedRow.customer_client.descriptive_name ||
                      String(typedRow.customer_client.id),
                    type: 'REGULAR' as const,
                    platform: 'Google Ads',
                    currencyCode:
                      typedRow.customer_client.currency_code || 'USD',
                    timezone: typedRow.customer_client.time_zone,
                  };
                });
                this.logger.log(
                  `MCC account ${customerId} with ${childAccounts.length} children`,
                );
                break;
              }
            }
          }
        } catch (error) {
          this.logger.debug(
            `Customer ${customerId} not an MCC: ${error.message}`,
          );
        }
      }

      // If no MCC, return regular accounts
      if (!managerCustomerId) {
        const regularAccounts = await Promise.all(
          customerIds.map(async (customerId) => {
            try {
              const customer: Customer = googleAdsClient.Customer({
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

              if (accountInfo && accountInfo.length > 0) {
                return {
                  id: String(accountInfo[0]?.customer?.id),
                  name:
                    accountInfo[0]?.customer?.descriptive_name ||
                    String(accountInfo[0]?.customer?.id),
                  type: 'REGULAR' as const,
                  platform: 'Google Ads',
                  currencyCode:
                    accountInfo[0]?.customer?.currency_code || 'USD',
                  timezone: accountInfo[0]?.customer?.time_zone,
                };
              }
            } catch (error) {
              this.logger.warn(
                `Could not fetch customer ${customerId}: ${error.message}`,
              );
            }

            return null;
          }),
        );

        const filteredAccounts = regularAccounts.filter(
          (a): a is NonNullable<typeof a> => a !== null,
        );

        return {
          accounts: filteredAccounts as AdAccount[],
        };
      }

      return {
        accounts: childAccounts,
        managerAccountId: managerCustomerId,
      };
    } catch (error) {
      this.logger.error('Failed to fetch accessible customers', error);
      throw error;
    }
  }

  async fetchCampaigns(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'refreshToken'
    >,
    customerId: string,
    managerCustomerId?: string,
  ): Promise<Campaign[]> {
    try {
      const googleAdsClient =
        await this.oauth2ClientManagerService.getGoogleAdsOAuth2Client(
          connectedAccount,
        );

      const customer: Customer = googleAdsClient.Customer({
        customer_id: customerId,
        login_customer_id: managerCustomerId || customerId,
        refresh_token: connectedAccount.refreshToken,
      });

      const campaigns = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign_budget.amount_micros,
          customer.currency_code
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `);

      return campaigns.map((row: unknown) => {
        const typedRow = row as {
          campaign: {
            name: string;
            id: string;
            status: string;
          };
          campaign_budget?: {
            amount_micros?: string;
          };
          customer: {
            currency_code: string;
          };
        };

        return {
          id: typedRow.campaign.id.toString(),
          name: typedRow.campaign.name,
          platform: 'Google Ads',
          externalId: typedRow.campaign.id.toString(),
          status: typedRow.campaign.status as CampaignStatus,
          dailyBudget: typedRow.campaign_budget?.amount_micros
            ? parseInt(typedRow.campaign_budget.amount_micros) / 1_000_000
            : undefined,
          currencyCode: typedRow.customer.currency_code || 'USD',
          connectedAccountId: connectedAccount.id,
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch campaigns for customer ${customerId}`,
        error,
      );
      throw error;
    }
  }

  async fetchMetrics(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'refreshToken'
    >,
    customerId: string,
    campaignIds: string[],
    dateRange: DateRange,
    managerCustomerId?: string,
  ): Promise<CampaignMetrics[]> {
    try {
      const googleAdsClient =
        await this.oauth2ClientManagerService.getGoogleAdsOAuth2Client(
          connectedAccount,
        );

      const customer: Customer = googleAdsClient.Customer({
        customer_id: customerId,
        login_customer_id: managerCustomerId || customerId,
        refresh_token: connectedAccount.refreshToken,
      });

      this.logger.log(
        `Fetching metrics for ${campaignIds.length} campaigns from ${dateRange.from} to ${dateRange.to}`,
      );

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
          AND segments.date BETWEEN '${dateRange.from}' AND '${dateRange.to}'
        ORDER BY segments.date DESC
        LIMIT 10000
      `);

      this.logger.log(`Retrieved ${metrics.length} metric rows`);

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
        const currencyCode = typedRow.customer.currency_code || 'USD';

        const cost: MoneyAmount = {
          amountMicros: costMicros,
          currencyCode,
        };

        const cpc: MoneyAmount | null =
          clicks > 0
            ? { amountMicros: Math.round(costMicros / clicks), currencyCode }
            : null;

        const cpa: MoneyAmount | null =
          conversions > 0
            ? {
                amountMicros: Math.round(costMicros / conversions),
                currencyCode,
              }
            : null;

        const roas =
          conversions > 0 ? conversionsValue / (costMicros / 1_000_000) : null;

        return {
          campaignId: typedRow.campaign.id.toString(),
          label: `${typedRow.campaign.name} - ${typedRow.segments.date}`,
          date: new Date(typedRow.segments.date),
          platform: 'Google Ads',
          device: typedRow.segments.device,
          adNetworkType: typedRow.segments.ad_network_type,
          currencyCode,
          impressions: parseInt(typedRow.metrics.impressions || '0'),
          clicks,
          conversions,
          conversionsValue,
          cost,
          cpc,
          cpa,
          cpm: parseFloat(typedRow.metrics.average_cpm || '0'),
          ctr: parseFloat(typedRow.metrics.ctr || '0'),
          conversionRate:
            conversions > 0 && clicks > 0 ? (conversions / clicks) * 100 : 0,
          interactions: parseInt(typedRow.metrics.interactions || '0'),
          allConversions: parseFloat(typedRow.metrics.all_conversions || '0'),
          allConversionsValue: parseFloat(
            typedRow.metrics.all_conversions_value || '0',
          ),
          viewThroughConversions: parseFloat(
            typedRow.metrics.view_through_conversions || '0',
          ),
          roas,
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch metrics for customer ${customerId}`,
        error,
      );
      throw error;
    }
  }
}
