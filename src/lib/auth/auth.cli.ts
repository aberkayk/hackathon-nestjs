import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { createAuthOptions } from './auth.options';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export const auth = betterAuth(
  createAuthOptions(prisma, {
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    frontendUrl: process.env.FRONTEND_URL,
  }),
);
