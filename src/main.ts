import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

import helmet from 'helmet';
import compression from 'compression';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
  });

  // Security headers
  app.use(helmet());

  // Response compression
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // automatically transform payloads to DTO instances
    }),
  );

  // Use NestJS Logger
  const logger = new Logger('Bootstrap');

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
