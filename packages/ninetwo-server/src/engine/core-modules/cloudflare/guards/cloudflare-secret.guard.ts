/* @license Enterprise */

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { timingSafeEqual } from 'crypto';

import { NinetwoConfigService } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.service';

@Injectable()
export class CloudflareSecretMatchGuard implements CanActivate {
  constructor(private readonly twentyConfigService: NinetwoConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest<Request>();

      const cloudflareWebhookSecret = this.twentyConfigService.get(
        'CLOUDFLARE_WEBHOOK_SECRET',
      );

      if (
        !cloudflareWebhookSecret ||
        (cloudflareWebhookSecret &&
          // @ts-expect-error legacy noImplicitAny
          (typeof request.headers['cf-webhook-auth'] === 'string' ||
            timingSafeEqual(
              // @ts-expect-error legacy noImplicitAny
              Buffer.from(request.headers['cf-webhook-auth']),
              Buffer.from(cloudflareWebhookSecret),
            )))
      ) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
