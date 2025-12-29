import { Module } from '@nestjs/common';
import { TranscriptionsGateway } from './transcriptions/transcriptions.gateway';
import { TranscriptionsController } from './transcriptions.controller';
import { TranscriptionsService } from './transcriptions.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Transcription,
  TranscriptionSchema,
} from './schemas/transcription.schema';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transcription.name, schema: TranscriptionSchema },
    ]),
    RedisModule,
    EmailModule,
  ],
  providers: [TranscriptionsService, TranscriptionsGateway],
  controllers: [TranscriptionsController],
})
export class TranscriptionsModule {}
