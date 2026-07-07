import {
  BadRequestException,
  ValidationPipe,
  type ValidationError,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

function flattenValidationErrors(
  errors: ValidationError[],
): { property: string; message: string }[] {
  return errors.flatMap((error) => {
    if (error.constraints) {
      return Object.values(error.constraints).map((message) => ({
        property: error.property,
        message,
      }));
    }
    return flattenValidationErrors(error.children ?? []);
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(flattenValidationErrors(errors)),
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: frontendUrl ? [frontendUrl] : false,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
