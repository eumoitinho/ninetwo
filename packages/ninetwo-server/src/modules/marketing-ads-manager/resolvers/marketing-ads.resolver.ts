import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { AdAccountsResultDto } from 'src/modules/marketing-ads-manager/dtos/ad-account.dto';
import {
  MarketingCampaignDto,
  MarketingMetricDto,
} from 'src/modules/marketing-ads-manager/dtos/campaign.dto';
import { DateRangeInput } from 'src/modules/marketing-ads-manager/dtos/date-range.input';
import { CampaignManagerService } from 'src/modules/marketing-ads-manager/services/campaign-manager.service';
import { GoogleAdsSyncService } from 'src/modules/marketing-ads-manager/services/google-ads-sync.service';
import { GoogleAnalyticsSyncService } from 'src/modules/marketing-ads-manager/services/google-analytics-sync.service';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class MarketingAdsResolver {
  constructor(
    private readonly googleAdsSyncService: GoogleAdsSyncService,
    private readonly googleAnalyticsSyncService: GoogleAnalyticsSyncService,
    private readonly campaignManagerService: CampaignManagerService,
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
  ) {}

  @Query(() => AdAccountsResultDto)
  async getMarketingAdAccounts(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AdAccountsResultDto> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspace.id,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
      relations: ['accountOwner'],
    });

    if (!connectedAccount) {
      throw new Error('Connected account not found');
    }

    if (!connectedAccount.refreshToken) {
      throw new Error(
        'No refresh token available. Please reconnect your account.',
      );
    }

    // Renovar tokens antes de usar
    const { accessToken, refreshToken } =
      await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
        connectedAccount,
        workspace.id,
      );

    const connectedAccountWithFreshTokens = {
      ...connectedAccount,
      accessToken,
      refreshToken,
    };

    if (connectedAccount.provider === 'google-ads') {
      return await this.googleAdsSyncService.fetchAccessibleCustomers(
        connectedAccountWithFreshTokens,
      );
    }

    throw new Error(
      `Provider ${connectedAccount.provider} not supported for ad accounts`,
    );
  }

  @Mutation(() => Boolean)
  async configureMarketingAdAccounts(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @Args('customerIds', { type: () => [String] })
    customerIds: string[],
    @Args('managerCustomerId', { type: () => String, nullable: true })
    managerCustomerId: string | null,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspace.id,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
    });

    if (!connectedAccount) {
      throw new Error('Connected account not found');
    }

    // Update syncConfig with selected customer IDs
    const syncConfig = {
      ...(connectedAccount.syncConfig || {}),
      marketing: {
        customerIds,
        managerCustomerId: managerCustomerId || undefined,
        enabled: true,
      },
    };

    await connectedAccountRepository.update(
      { id: connectedAccountId },
      { syncConfig },
    );

    return true;
  }

  @Query(() => [MarketingCampaignDto])
  async getMarketingCampaigns(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @Args('customerId', { type: () => String })
    customerId: string,
    @Args('managerCustomerId', { type: () => String, nullable: true })
    managerCustomerId: string | null,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<MarketingCampaignDto[]> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspace.id,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
    });

    if (!connectedAccount) {
      throw new Error('Connected account not found');
    }

    if (connectedAccount.provider === 'google-ads') {
      return await this.googleAdsSyncService.fetchCampaigns(
        connectedAccount,
        customerId,
        managerCustomerId || undefined,
      );
    }

    throw new Error(
      `Provider ${connectedAccount.provider} not supported for campaigns`,
    );
  }

  @Query(() => [MarketingMetricDto])
  async getMarketingMetrics(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @Args('customerId', { type: () => String })
    customerId: string,
    @Args('campaignIds', { type: () => [String] })
    campaignIds: string[],
    @Args('dateRange', { type: () => DateRangeInput })
    dateRange: DateRangeInput,
    @Args('managerCustomerId', { type: () => String, nullable: true })
    managerCustomerId: string | null,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<MarketingMetricDto[]> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspace.id,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
    });

    if (!connectedAccount) {
      throw new Error('Connected account not found');
    }

    if (connectedAccount.provider === 'google-ads') {
      return await this.googleAdsSyncService.fetchMetrics(
        connectedAccount,
        customerId,
        campaignIds,
        dateRange,
        managerCustomerId || undefined,
      );
    }

    throw new Error(
      `Provider ${connectedAccount.provider} not supported for metrics`,
    );
  }

  @Mutation(() => Boolean)
  async pauseMarketingCampaign(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @Args('customerId', { type: () => String })
    customerId: string,
    @Args('campaignId', { type: () => String })
    campaignId: string,
    @Args('managerCustomerId', { type: () => String, nullable: true })
    managerCustomerId: string | null,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspace.id,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
    });

    if (!connectedAccount) {
      throw new Error('Connected account not found');
    }

    return await this.campaignManagerService.pauseCampaign(
      connectedAccount,
      customerId,
      campaignId,
      managerCustomerId || undefined,
    );
  }

  @Mutation(() => Boolean)
  async activateMarketingCampaign(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @Args('customerId', { type: () => String })
    customerId: string,
    @Args('campaignId', { type: () => String })
    campaignId: string,
    @Args('managerCustomerId', { type: () => String, nullable: true })
    managerCustomerId: string | null,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspace.id,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
    });

    if (!connectedAccount) {
      throw new Error('Connected account not found');
    }

    return await this.campaignManagerService.activateCampaign(
      connectedAccount,
      customerId,
      campaignId,
      managerCustomerId || undefined,
    );
  }

  @Query(() => AdAccountsResultDto)
  async getMarketingAnalyticsAccounts(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AdAccountsResultDto> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspace.id,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
      relations: ['accountOwner'],
    });

    if (!connectedAccount) {
      throw new Error('Connected account not found');
    }

    if (!connectedAccount.refreshToken) {
      throw new Error(
        'No refresh token available. Please reconnect your account.',
      );
    }

    // Renovar tokens antes de usar
    const { accessToken, refreshToken } =
      await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
        connectedAccount,
        workspace.id,
      );

    const connectedAccountWithFreshTokens = {
      ...connectedAccount,
      accessToken,
      refreshToken,
    };

    if (connectedAccount.provider === 'google-analytics') {
      return await this.googleAnalyticsSyncService.fetchProperties(
        connectedAccountWithFreshTokens,
      );
    }

    throw new Error(
      `Provider ${connectedAccount.provider} not supported for analytics`,
    );
  }

  @Mutation(() => Boolean)
  async configureMarketingAnalyticsAccounts(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @Args('propertyIds', { type: () => [String] })
    propertyIds: string[],
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspace.id,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
    });

    if (!connectedAccount) {
      throw new Error('Connected account not found');
    }

    // Update syncConfig with selected property IDs
    const syncConfig = {
      ...(connectedAccount.syncConfig || {}),
      analytics: {
        propertyIds,
        enabled: true,
      },
    };

    await connectedAccountRepository.update(
      { id: connectedAccountId },
      { syncConfig },
    );

    return true;
  }
}
