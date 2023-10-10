import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT'));
  const clientPort = parseInt(configService.get('CLIENT_PORT'));
  const logger = new Logger('Main (main.ts)');

  app.enableCors({
    origin: [`http://localhost:${clientPort}`],
  });

  await app.listen(port);
  logger.log(`Server running on port ${port}`);
}
bootstrap();
