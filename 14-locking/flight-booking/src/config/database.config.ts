import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvironmentKey } from 'src/constants/environment-key';

export const getDatabaseConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  url: configService.get<string>(EnvironmentKey.DATABASE_URL),
  autoLoadEntities: true,
});
