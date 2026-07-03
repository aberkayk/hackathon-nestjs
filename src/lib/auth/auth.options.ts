import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { BetterAuthOptions } from 'better-auth';
import type { PrismaClient } from '../../generated/prisma/client';

export interface AuthEnv {
  secret?: string;
  baseURL?: string;
  frontendUrl?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  githubClientId?: string;
  githubClientSecret?: string;
}

export function createAuthOptions(
  prisma: PrismaClient,
  env: AuthEnv,
): BetterAuthOptions {
  return {
    secret: env.secret,
    baseURL: env.baseURL,
    trustedOrigins: env.frontendUrl ? [env.frontendUrl] : [],
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: { enabled: true },
    socialProviders: {
      google: {
        clientId: env.googleClientId ?? '',
        clientSecret: env.googleClientSecret ?? '',
      },
      github: {
        clientId: env.githubClientId ?? '',
        clientSecret: env.githubClientSecret ?? '',
      },
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
      },
    },
  };
}
