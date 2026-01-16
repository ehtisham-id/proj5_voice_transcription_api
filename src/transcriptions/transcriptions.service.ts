import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transcription,
  TranscriptionDocument,
} from './schemas/transcription.schema';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { RedisService } from '../redis/redis.service';
import { TranscriptionsGateway } from './transcriptions/transcriptions.gateway';

@Injectable()
export class TranscriptionsService {
  private readonly logger = new Logger(TranscriptionsService.name);

  constructor(
    @InjectModel(Transcription.name)
    private transcriptionModel: Model<TranscriptionDocument>,
    private readonly redisService: RedisService,
    private readonly gateway: TranscriptionsGateway,
  ) {}

  // Upload & transcribe with WebSocket status
  async uploadAndTranscribe(file: Express.Multer.File, userId: string) {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    try {
      fs.writeFileSync(filePath, file.buffer);

      this.gateway.emitStatus(userId, 'Uploading audio');

      const uploadResp = await axios.post(
        'https://api.assemblyai.com/v2/upload',
        fs.createReadStream(filePath),
        {
          headers: {
            authorization: process.env.ASSEMBLYAI_API_KEY,
            'Content-Type': 'application/octet-stream',
          },
        },
      );

      this.gateway.emitStatus(userId, 'Transcribing audio');

      const transcriptResp = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        { audio_url: uploadResp.data.upload_url },
        { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } },
      );

      let text = '';
      while (true) {
        const check = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptResp.data.id}`,
          { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } },
        );

        if (check.data.status === 'completed') {
          text = check.data.text;
          break;
        }

        if (check.data.status === 'error') {
          throw new Error('Transcription failed');
        }

        await new Promise((r) => setTimeout(r, 3000));
      }

      const transcription = await this.transcriptionModel.create({
        userId,
        fileName,
        text,
      });

      await this.redisService.del(`transcriptions:${userId}`);

      this.gateway.emitStatus(userId, 'Completed');

      return transcription;
    } catch (err) {
      this.gateway.emitStatus(userId, 'Failed');
      this.logger.error(err);
      throw err;
    }
  }

  async findAll(userId: string) {
    const cacheKey = `transcriptions:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const data = await this.transcriptionModel
      .find({ userId })
      .sort({ createdAt: -1 });

    await this.redisService.set(cacheKey, data, 60);
    return data;
  }

  async findOne(id: string, userId: string) {
    return this.transcriptionModel.findOne({ _id: id, userId });
  }

  async create(userId: string, text: string) {
    const transcription = await this.transcriptionModel.create({
      userId,
      text,
      fileName: null,
    });
    await this.redisService.del(`transcriptions:${userId}`);
    return transcription;
  }

  async delete(id: string, userId: string) {
    const doc = await this.transcriptionModel.findOne({ _id: id, userId });
    if (!doc) return null;

    // Delete file from uploads folder
    if (doc.fileName) {
      const filePath = path.join(
        process.env.UPLOAD_DIR || 'uploads',
        doc.fileName,
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await this.transcriptionModel.deleteOne({ _id: id, userId });
    await this.redisService.del(`transcriptions:${userId}`);
    return { success: true };
  }
}
