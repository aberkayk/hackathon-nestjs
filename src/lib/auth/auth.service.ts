import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { PrismaService } from '../database/prisma.service';
import { createAuthOptions } from './auth.options';

@Injectable()
export class AuthService {
  readonly instance: ReturnType<typeof betterAuth>;

  constructor(config: ConfigService, prisma: PrismaService) {
    this.instance = betterAuth(
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
}
