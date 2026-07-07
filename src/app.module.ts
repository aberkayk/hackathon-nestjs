import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BetterAuthModule } from 'nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createAuthOptions } from './lib/auth/auth.options';
import { PrismaModule } from './lib/database/prisma.module';
import { PrismaService } from './lib/database/prisma.service';
import { UserModule } from './module/user/user.module';
import { HackathonModule } from './module/hackathon/hackathon.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BetterAuthModule.forRootAsync({
      inject: [ConfigService, PrismaService],
      useFactory: (config: ConfigService, prisma: PrismaService) => ({
        betterAuthConfig: createAuthOptions(prisma, {
          secret: config.get<string>('BETTER_AUTH_SECRET'),
          baseURL: config.get<string>('BETTER_AUTH_URL'),
          frontendUrl: config.get<string>('FRONTEND_URL'),
          googleClientId: config.get<string>('GOOGLE_CLIENT_ID'),
          googleClientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
          githubClientId: config.get<string>('GITHUB_CLIENT_ID'),
          githubClientSecret: config.get<string>('GITHUB_CLIENT_SECRET'),
        }),
      }),
    }),
    UserModule,
    HackathonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
