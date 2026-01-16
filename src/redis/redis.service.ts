import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        lazyConnect: false, // auto connect
        retryStrategy(times) {
          return Math.min(times * 100, 3000);
        },
      });

      this.client.on('connect', () => this.logger.log('✅ Redis connected'));

      this.client.on('error', (err) =>
        this.logger.warn(`⚠️ Redis error: ${err.message}`),
      );
    } catch (err) {
      this.logger.warn(
        '❌ Redis initialization failed. Running without cache.',
      );
      this.client = null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.client) return;

    try {
      const data = JSON.stringify(value);
      ttl
        ? await this.client.set(key, data, 'EX', ttl)
        : await this.client.set(key, data);
    } catch {
      this.logger.warn(`⚠️ Redis SET failed (${key})`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;

    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      this.logger.warn(`⚠️ Redis GET failed (${key})`);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.del(key);
    } catch {
      this.logger.warn(`⚠️ Redis DEL failed (${key})`);
    }
  }

  async onModuleDestroy() {
    if (!this.client) return;

    try {
      await this.client.quit();
    } catch {
      this.logger.warn('⚠️ Redis quit failed');
    }
  }
}
