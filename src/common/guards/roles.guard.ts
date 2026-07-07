import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectBetterAuth } from 'nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import type { AuthInstance } from '../../lib/auth/auth.types';
import type { Role } from '../../generated/prisma/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectBetterAuth() private readonly auth: AuthInstance,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    return requiredRoles.includes(session.user.role);
  }
}
