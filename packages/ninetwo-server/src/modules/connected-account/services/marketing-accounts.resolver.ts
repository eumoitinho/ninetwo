import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { GoogleAdsAccountService } from 'src/modules/connected-account/services/google-ads-account.service';
import { GoogleAnalyticsPropertyService } from 'src/modules/connected-account/services/google-analytics-property.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class MarketingAccountsResolver {
  constructor(
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
    private readonly googleAdsAccountService: GoogleAdsAccountService,
    private readonly googleAnalyticsPropertyService: GoogleAnalyticsPropertyService,
  ) {}

  @Query(() => String)
  async getGoogleAdsAccounts(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<string> {
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

    const accounts =
      await this.googleAdsAccountService.listAccessibleAccounts(
        connectedAccount,
      );

    return JSON.stringify(accounts);
  }

  @Query(() => String)
  async getGoogleAdsMCCChildAccounts(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @Args('mccCustomerId', { type: () => String })
    mccCustomerId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<string> {
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

    const childAccounts =
      await this.googleAdsAccountService.getMCCChildAccounts(
        connectedAccount,
        mccCustomerId,
      );

    return JSON.stringify(childAccounts);
  }

  @Query(() => String)
  async getGoogleAnalyticsProperties(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<string> {
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

    const accountsAndProperties =
      await this.googleAnalyticsPropertyService.listAccountsAndProperties(
        connectedAccount,
      );

    return JSON.stringify(accountsAndProperties);
  }
}

