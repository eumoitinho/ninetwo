import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { NinetwoORMGlobalManager } from 'src/engine/ninetwo-orm/ninetwo-orm-global.manager';
import { type MarketingChannelWorkspaceEntity } from 'src/modules/marketing/common/standard-objects/marketing-channel.workspace-entity';
import { MarketingChannelConfigSuccessDTO } from 'src/modules/marketing/dtos/marketing-channel-config-success.dto';
import { MarketingAPIsService } from 'src/modules/marketing/services/marketing-apis.service';
import {
  MarketingDataFetchJob,
  type MarketingDataFetchJobData,
} from 'src/modules/marketing/sync/jobs/marketing-data-fetch.job';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class MarketingChannelResolver {
  constructor(
    private readonly twentyORMGlobalManager: NinetwoORMGlobalManager,
    private readonly marketingAPIsService: MarketingAPIsService,
    @InjectMessageQueue(MessageQueue.marketingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Mutation(() => MarketingChannelConfigSuccessDTO)
  async updateMarketingChannelAccountConfig(
    @Args('marketingChannelId', { type: () => UUIDScalarType })
    marketingChannelId: string,
    @Args('accountConfig', { type: () => String })
    accountConfigJson: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<MarketingChannelConfigSuccessDTO> {
    const accountConfig = JSON.parse(accountConfigJson);

    await this.marketingAPIsService.updateMarketingChannelAccountConfig(
      marketingChannelId,
      workspace.id,
      accountConfig,
    );

    return { success: true, marketingChannelId };
  }

  @Mutation(() => Boolean)
  async triggerMarketingChannelSync(
    @Args('marketingChannelId', { type: () => UUIDScalarType })
    marketingChannelId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    await this.messageQueueService.add<MarketingDataFetchJobData>(
      MarketingDataFetchJob.name,
      {
        marketingChannelId,
        workspaceId: workspace.id,
      },
    );

    return true;
  }

  @Query(() => String)
  async getMarketingChannel(
    @Args('marketingChannelId', { type: () => UUIDScalarType })
    marketingChannelId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<string> {
    const marketingChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MarketingChannelWorkspaceEntity>(
        workspace.id,
        'marketingChannel',
        { shouldBypassPermissionChecks: true },
      );

    const marketingChannel = await marketingChannelRepository.findOne({
      where: { id: marketingChannelId },
      relations: ['connectedAccount'],
    });

    if (!marketingChannel) {
      throw new Error('Marketing channel not found');
    }

    return JSON.stringify(marketingChannel);
  }
}
