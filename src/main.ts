import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify/adapters';
import { AppModule } from './app.module';

import multer from 'fastify-multer';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  fastifyAdapter;
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.register(multer({ limits: { fields: 3, files: 1 } }).contentParser);
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
