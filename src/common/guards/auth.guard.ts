import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { AuthService } from '../../lib/auth/auth.service';
import type { AuthSession } from '../../lib/auth/auth.types';

export interface RequestWithSession extends Request {
  session: AuthSession['session'];
  user: AuthSession['user'];
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithSession>();

    const session = await this.authService.instance.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    request.session = session.session;
    request.user = session.user;

    return true;
  }
}
