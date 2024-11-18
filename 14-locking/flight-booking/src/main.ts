import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvironmentKey } from './constants/environment.const';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>(EnvironmentKey.PORT) || 5000;
  await app.listen(port);
  console.log(`Server listening on port ${port}`);
}
bootstrap();
