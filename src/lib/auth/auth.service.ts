import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { PrismaService } from '../database/prisma.service';
import { createAuthOptions } from './auth.options';

function buildAuth(config: ConfigService, prisma: PrismaService) {
  return betterAuth(
    createAuthOptions(prisma, {
      secret: config.get<string>('BETTER_AUTH_SECRET'),
      baseURL: config.get<string>('BETTER_AUTH_URL'),
      frontendUrl: config.get<string>('FRONTEND_URL'),
      googleClientId: config.get<string>('GOOGLE_CLIENT_ID'),
      googleClientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
      githubClientId: config.get<string>('GITHUB_CLIENT_ID'),
      githubClientSecret: config.get<string>('GITHUB_CLIENT_SECRET'),
    }),
  );
}

@Injectable()
export class AuthService {
  readonly instance: ReturnType<typeof buildAuth>;

  constructor(config: ConfigService, prisma: PrismaService) {
    this.instance = buildAuth(config, prisma);
  }
}
