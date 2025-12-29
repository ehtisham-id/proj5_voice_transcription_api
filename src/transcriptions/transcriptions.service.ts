import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transcription } from './schemas/transcription.schema';
import { RedisService } from '../redis/redis.service';
import { TranscriptionsGateway } from './transcriptions/transcriptions.gateway';

@Injectable()
export class TranscriptionsService {
  constructor(
    @InjectModel(Transcription.name)
    private readonly transcriptionModel: Model<Transcription>,
    private readonly redisService: RedisService,
    private readonly transcriptionsGateway: TranscriptionsGateway,
  ) {}

  private cacheKey(transcriptionId: string): string {
    return `transcription:${transcriptionId}`;
  }

  async create(userId: string, text: string, audioFile?: string) {
    const transcription = await this.transcriptionModel.create({
      userId,
      text,
      audioFile,
    });
    this.transcriptionsGateway.emitCreated(transcription);
  }

  async findAll(userId: string) {
    const cached = await this.redisService.get<Transcription[]>(
      this.cacheKey(userId),
    );
    if (cached) return cached;

    const data = await this.transcriptionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();

    await this.redisService.set(this.cacheKey(userId), data, 60);
    return data;
  }

  async findOne(id: string, userId: string) {
    const transcription = await this.transcriptionModel.findById(id);
    if (!transcription) throw new NotFoundException('Transcription not found');

    if (transcription.userId !== userId) throw new ForbiddenException();

    return transcription;
  }

  async delete(id: string, userId: string) {
    const transcription = await this.findOne(id, userId);
    await transcription.deleteOne();

    await this.redisService.del(this.cacheKey(userId));
    this.transcriptionsGateway.emitDeleted(id);

    return { deleted: true };
  }
}
