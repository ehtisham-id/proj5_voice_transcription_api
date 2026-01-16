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

@Injectable()
export class TranscriptionsService {
  private readonly logger = new Logger(TranscriptionsService.name);

  constructor(
    @InjectModel(Transcription.name)
    private transcriptionModel: Model<TranscriptionDocument>,
    private readonly redisService: RedisService,
  ) {}

  /* ----------------------------------
     UPLOAD + TRANSCRIBE
  -----------------------------------*/
  async uploadAndTranscribe(file: Express.Multer.File, userId: string) {
    try {
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      const timestamp = Date.now();
      const safeFileName = `${timestamp}-${file.originalname}`;
      const filePath = path.join(uploadDir, safeFileName);

      fs.writeFileSync(filePath, file.buffer);

      // 1️⃣ Upload to AssemblyAI
      const uploadResponse = await axios.post(
        'https://api.assemblyai.com/v2/upload',
        fs.createReadStream(filePath),
        {
          headers: {
            authorization: process.env.ASSEMBLYAI_API_KEY,
            'Content-Type': 'application/octet-stream',
          },
        },
      );

      const audioUrl = uploadResponse.data.upload_url;

      // 2️⃣ Start transcription
      const transcriptResp = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        { audio_url: audioUrl },
        {
          headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
        },
      );

      const transcriptionId = transcriptResp.data.id;

      // 3️⃣ Poll AssemblyAI
      let text = '';
      while (true) {
        const check = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptionId}`,
          {
            headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
          },
        );

        if (check.data.status === 'completed') {
          text = check.data.text;
          break;
        }

        if (check.data.status === 'error') {
          throw new Error('AssemblyAI transcription failed');
        }

        await new Promise((r) => setTimeout(r, 3000));
      }

      // 4️⃣ Save to DB
      const transcription = await this.transcriptionModel.create({
        userId,
        fileName: safeFileName,
        text,
      });

      // 5️⃣ 🔥 INVALIDATE CACHE (CRITICAL FIX)
      await this.redisService.del(`transcriptions:${userId}`);

      this.logger.log(`✅ Transcription saved for user ${userId}`);

      return transcription;
    } catch (error) {
      this.logger.error('❌ Transcription failed', error);
      throw error;
    }
  }

  /* ----------------------------------
     GET ALL (CACHE-FIRST)
  -----------------------------------*/
  async findAll(userId: string) {
    const cacheKey = `transcriptions:${userId}`;

    // 1️⃣ Try Redis first
    const cached =
      await this.redisService.get<TranscriptionDocument[]>(cacheKey);

    if (cached) {
      this.logger.log('📦 Returning transcriptions from Redis');
      return cached;
    }

    // 2️⃣ Fetch from DB
    const transcriptions = await this.transcriptionModel
      .find({ userId })
      .sort({ createdAt: -1 });

    // 3️⃣ Save to Redis
    await this.redisService.set(cacheKey, transcriptions, 60);

    return transcriptions;
  }

  /* ----------------------------------
     GET ONE
  -----------------------------------*/
  async findOne(id: string) {
    return this.transcriptionModel.findById(id);
  }

  /* ----------------------------------
     DELETE
  -----------------------------------*/
  async delete(id: string, userId: string) {
    const deleted = await this.transcriptionModel.findByIdAndDelete(id);

    if (deleted) {
      await this.redisService.del(`transcriptions:${userId}`);
    }

    return deleted;
  }

  /* ----------------------------------
     CREATE (TEXT ONLY)
  -----------------------------------*/
  async create(userId: string, text: string) {
    const transcription = await this.transcriptionModel.create({
      userId,
      text,
      fileName: null,
    });

    await this.redisService.del(`transcriptions:${userId}`);

    return transcription;
  }
}
