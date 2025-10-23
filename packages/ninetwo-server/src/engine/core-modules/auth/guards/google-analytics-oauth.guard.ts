import {
    type CanActivate,
    type ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAnalyticsOauthGuard
  extends AuthGuard('google-analytics')
  implements CanActivate
{
  constructor() {
    super({
      state: true,
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Pass transient token as state parameter for OAuth flow
    if (request.query.transientToken) {
      request.authInfo = {
        state: request.query.transientToken,
      };
    }
    
    const canActivate = (await super.canActivate(context)) as boolean;

    return canActivate;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    return {
      state: request.query.transientToken,
    };
  }
}

