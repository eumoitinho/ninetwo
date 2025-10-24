import {
    Controller,
    Get,
    Req,
    Res,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Response } from 'express';
import { Repository } from 'typeorm';

import {
    AuthException,
    AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { GoogleAdsOauthGuard } from 'src/engine/core-modules/auth/guards/google-ads-oauth.guard';
import { MarketingAuthService } from 'src/engine/core-modules/auth/services/marketing-auth.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

type GoogleAdsRequest = {
  user: {
    accessToken: string;
    refreshToken: string;
    transientToken?: string;
    emails: Array<{ value: string; verified: boolean }>;
  };
  query: {
    redirect?: string;
  };
};

@Controller('auth/google-ads')
@UseFilters(AuthRestApiExceptionFilter)
export class GoogleAdsAuthController {
  constructor(
    private readonly marketingAuthService: MarketingAuthService,
    private readonly transientTokenService: TransientTokenService,
    private readonly twentyConfigService: NinetwoConfigService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  @Get()
  @UseGuards(GoogleAdsOauthGuard, PublicEndpointGuard)
  async googleAdsAuth() {
    // Trigger OAuth flow
    return;
  }

  @Get('redirect')
  @UseGuards(GoogleAdsOauthGuard, PublicEndpointGuard)
  async googleAdsAuthRedirect(
    @Req() req: GoogleAdsRequest,
    @Res() res: Response,
  ) {
    try {
      const { accessToken, refreshToken, transientToken, emails } = req.user;

      if (!transientToken) {
        throw new AuthException(
          'Transient token missing',
          AuthExceptionCode.INVALID_DATA,
        );
      }

      const { workspaceMemberId, workspaceId } =
        await this.transientTokenService.verifyTransientToken(transientToken);

      if (!workspaceId) {
        throw new AuthException(
          'Workspace not found',
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      const workspace = await this.workspaceRepository.findOneBy({
        id: workspaceId,
      });

      if (!workspace) {
        throw new AuthException(
          'Workspace not found',
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      const handle =
        emails.find((email) => email.verified)?.value || emails[0]?.value;

      const connectedAccountId =
        await this.marketingAuthService.saveMarketingConnectedAccount({
          handle,
          workspaceMemberId,
          workspaceId,
          provider: 'google-ads',
          accessToken,
          refreshToken,
        });

      const redirectPath =
        req.query.redirect ||
        `/settings/integrations/marketing?connected=google-ads&accountId=${connectedAccountId}`;

      const url = this.workspaceDomainsService.buildWorkspaceURL({
        workspace,
        pathname: redirectPath,
      });

      return res.redirect(url.toString());
    } catch (error) {
      const frontendUrl = this.twentyConfigService.get('FRONTEND_URL');

      return res.redirect(`${frontendUrl}/verify?errorMessage=${encodeURIComponent(error.message)}`);
    }
  }
}

