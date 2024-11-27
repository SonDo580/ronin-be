import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseProviders } from './database.providers';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        // configService.get(ConfigToken.TYPEORM),
        {
          const typeOrmConfig = configService.get('typeorm'); // Ensure this is returning a valid object
          if (!typeOrmConfig) {
            throw new Error('TypeORM configuration is not available');
          }
          console.log('TypeORM Config:', typeOrmConfig); // Add this log to verify the config
          return typeOrmConfig;
        },
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
