import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithSession } from '../guards/auth.guard';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithSession>();
    return request.user;
  },
);
