/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TranscriptionsModule } from './transcriptions/transcriptions.module';
import { EmailModule } from './email/email.module';
import { RedisModule } from './redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: +process.env.THROTTLE_TTL,
          limit: +process.env.THROTTLE_LIMIT,
        },
      ],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    UsersModule,
    TranscriptionsModule,
    EmailModule,
    RedisModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
