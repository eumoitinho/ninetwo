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
import { MarketingChannelSyncStage } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import { AdAccountsResultDto } from 'src/modules/marketing/marketing-realtime-manager/dtos/ad-account.dto';
import {
  MarketingCampaignDto,
  MarketingMetricDto,
} from 'src/modules/marketing/marketing-realtime-manager/dtos/campaign.dto';
import { DateRangeInput } from 'src/modules/marketing/marketing-realtime-manager/dtos/date-range.input';
import { CampaignManagerService } from 'src/modules/marketing/marketing-realtime-manager/services/campaign-manager.service';
import { GoogleAdsSyncService } from 'src/modules/marketing/marketing-realtime-manager/services/google-ads-sync.service';
import { GoogleAnalyticsSyncService } from 'src/modules/marketing/marketing-realtime-manager/services/google-analytics-sync.service';

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

    // No Twenty-style, usamos provider 'google' e verificamos pelos scopes
    if (connectedAccount.provider === 'google') {
      // Verificar se tem scope do Google Ads
      const hasAdsScope = connectedAccount.scopes?.includes(
        'https://www.googleapis.com/auth/adwords',
      );

      if (hasAdsScope) {
        return await this.googleAdsSyncService.fetchAccessibleCustomers(
          connectedAccountWithFreshTokens,
        );
      }

      throw new Error(
        'Connected account does not have Google Ads permissions',
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
    connectedAccount.syncConfig = {
      ...(connectedAccount.syncConfig || {}),
      marketing: {
        customerIds,
        managerCustomerId: managerCustomerId || undefined,
        enabled: true,
      },
    };

    await connectedAccountRepository.save(connectedAccount);

    // Criar ou atualizar MarketingChannel
    const marketingChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspace.id,
        'marketingChannel',
      );

    const { MarketingChannelType } = await import(
      'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity'
    );

    let marketingChannel = await marketingChannelRepository.findOne({
      where: {
        connectedAccountId,
        type: MarketingChannelType.GOOGLE_ADS as any,
      },
    });

    const accountConfig = {
      customerIds,
      managerCustomerId: managerCustomerId || undefined,
    };

    if (!marketingChannel) {
      // Criar novo MarketingChannel
      const { v4: uuidv4 } = await import('uuid');
      const { MarketingChannelSyncStage, MarketingChannelSyncStatus } =
        await import(
          'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity'
        );

      marketingChannel = await marketingChannelRepository.save({
        id: uuidv4(),
        connectedAccountId,
        handle: connectedAccount.handle,
        type: MarketingChannelType.GOOGLE_ADS as any,
        isSyncEnabled: true,
        syncStatus: MarketingChannelSyncStatus.NOT_SYNCED,
        syncStage: MarketingChannelSyncStage.DATA_FETCH_PENDING,
        throttleFailureCount: 0,
        syncCursor: '',
        accountConfig,
      });
    } else {
      // Atualizar accountConfig existente
      await marketingChannelRepository.update(marketingChannel.id, {
        accountConfig,
        syncStage: MarketingChannelSyncStage.DATA_FETCH_PENDING as any,
      });
    }

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

    if (connectedAccount.provider === 'google') {
      const hasAdsScope = connectedAccount.scopes?.includes(
        'https://www.googleapis.com/auth/adwords',
      );

      if (hasAdsScope) {
        return await this.googleAdsSyncService.fetchCampaigns(
          connectedAccount,
          customerId,
          managerCustomerId || undefined,
        );
      }

      throw new Error(
        'Connected account does not have Google Ads permissions',
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

    if (connectedAccount.provider === 'google') {
      const hasAdsScope = connectedAccount.scopes?.includes(
        'https://www.googleapis.com/auth/adwords',
      );

      if (hasAdsScope) {
        return await this.googleAdsSyncService.fetchMetrics(
          connectedAccount,
          customerId,
          campaignIds,
          dateRange,
          managerCustomerId || undefined,
        );
      }

      throw new Error(
        'Connected account does not have Google Ads permissions',
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

    if (connectedAccount.provider === 'google') {
      const hasAnalyticsScope = connectedAccount.scopes?.includes(
        'https://www.googleapis.com/auth/analytics.readonly',
      );

      if (hasAnalyticsScope) {
        return await this.googleAnalyticsSyncService.fetchProperties(
          connectedAccountWithFreshTokens,
        );
      }

      throw new Error(
        'Connected account does not have Google Analytics permissions',
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
    connectedAccount.syncConfig = {
      ...(connectedAccount.syncConfig || {}),
      analytics: {
        propertyIds,
        enabled: true,
      },
    };

    await connectedAccountRepository.save(connectedAccount);

    // Criar ou atualizar MarketingChannel para Analytics
    const marketingChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspace.id,
        'marketingChannel',
      );

    const { MarketingChannelType } = await import(
      'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity'
    );

    let marketingChannel = await marketingChannelRepository.findOne({
      where: {
        connectedAccountId,
        type: MarketingChannelType.GOOGLE_ANALYTICS as any,
      },
    });

    const accountConfig = {
      propertyIds,
    };

    if (!marketingChannel) {
      // Criar novo MarketingChannel
      const { v4: uuidv4 } = await import('uuid');
      const { MarketingChannelSyncStage, MarketingChannelSyncStatus } =
        await import(
          'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity'
        );

      marketingChannel = await marketingChannelRepository.save({
        id: uuidv4(),
        connectedAccountId,
        handle: connectedAccount.handle,
        type: MarketingChannelType.GOOGLE_ANALYTICS as any,
        isSyncEnabled: true,
        syncStatus: MarketingChannelSyncStatus.NOT_SYNCED,
        syncStage: MarketingChannelSyncStage.DATA_FETCH_PENDING,
        throttleFailureCount: 0,
        syncCursor: '',
        accountConfig,
      });
    } else {
      // Atualizar accountConfig existente
      await marketingChannelRepository.update(marketingChannel.id, {
        accountConfig,
        syncStage: MarketingChannelSyncStage.DATA_FETCH_PENDING as any,
      });
    }

    return true;
  }
}
