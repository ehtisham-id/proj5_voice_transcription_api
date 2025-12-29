import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000); // retry with delay
        return delay;
      },
    });

    this.client.on('connect', () => this.logger.log('✅ Redis connected'));
    this.client.on('error', (err) => {
      this.logger.error('❌ Redis connection error', err.message);
    });

    // Optional: catch startup connect failure
    this.client.connect().catch((err) => {
      this.logger.error(
        '❌ Initial Redis connection failed. Continuing without cache.',
        err.message,
      );
    });
  }

  async set<T>(key: string, value: T, expireInSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (expireInSeconds) {
        await this.client.set(key, data, 'EX', expireInSeconds);
      } else {
        await this.client.set(key, data);
      }
    } catch (err) {
      this.logger.warn(`⚠️ Redis SET failed for key "${key}"`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (data) return JSON.parse(data) as T;
    } catch {
      this.logger.warn(`⚠️ Redis GET failed for key "${key}"`);
    }
    return null;
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      this.logger.warn(`⚠️ Redis DEL failed for key "${key}"`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch {
      this.logger.warn('⚠️ Redis quit failed');
    }
  }
}
