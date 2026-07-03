import type { AuthService } from './auth.service';

export type AuthSession = NonNullable<
  Awaited<ReturnType<AuthService['instance']['api']['getSession']>>
>;
