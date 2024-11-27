import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingsModule } from './modules/bookings/bookings.module';
import { SeatsModule } from './modules/seats/seats.module';
import { RedisModule } from './modules/redis/redis.module';
import { DatabaseModule } from './modules/database/database.module';
import dataSource from './modules/database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dataSource],
    }),
    BookingsModule,
    SeatsModule,
    RedisModule,
    DatabaseModule,
  ],
})
export class AppModule {}
