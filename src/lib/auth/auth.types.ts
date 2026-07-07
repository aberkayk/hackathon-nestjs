import type { Auth } from 'better-auth';
import type { createAuthOptions } from './auth.options';

export type AuthInstance = Auth<ReturnType<typeof createAuthOptions>>;

export type AuthSession = AuthInstance['$Infer']['Session'];
