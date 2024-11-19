import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import Redlock, { Lock } from 'redlock';
import { EnvironmentKey } from 'src/constants/environment-key';

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient: Redis;
  private redLock: Redlock;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>(EnvironmentKey.REDIS_URL);
    this.redisClient = new Redis(redisUrl);
    this.redLock = new Redlock([this.redisClient]);
  }

  // Acquire a lock
  async acquireLock(
    resource: string,
    duration: number = 5000,
  ): Promise<Lock | null> {
    try {
      const lock = await this.redLock.acquire([resource], duration);
      return lock;
    } catch (error) {
      return null;
    }
  }

  // Release a lock
  async releaseLock(lock: Lock): Promise<void> {
    try {
      await this.redLock.release(lock);
    } catch (error) {}
  }
}
