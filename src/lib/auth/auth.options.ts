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

export function createAuthOptions(prisma: PrismaClient, env: AuthEnv) {
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
    user: {
      additionalFields: {
        role: {
          type: ['PARTICIPANT', 'ADMIN'] as const,
          input: false,
          defaultValue: 'PARTICIPANT',
        },
      },
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
      },
    },
  } satisfies BetterAuthOptions;
}
