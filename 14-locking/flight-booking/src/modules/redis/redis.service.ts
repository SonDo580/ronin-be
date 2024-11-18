import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis();
    this.redisClient.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }

  // Acquire a lock
  async acquireLock(lockKey: string, lockTTL: number = 5000): Promise<boolean> {
    const result = await this.redisClient.set(
        lockKey,
        'locked',
        'NX',
        'PX',
        lockTTL,
      );

    return result === 'OK';

    // TODO:
    // - There's type error, although it worked fine in JS project
    // => Check other redis packages
  }

  // Release a lock
  async releaseLock(lockKey: string): Promise<void> {
    await this.redisClient.unlink(lockKey);
  }
}
