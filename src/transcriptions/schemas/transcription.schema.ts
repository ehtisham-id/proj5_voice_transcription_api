import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranscriptionDocument = Transcription & Document;

@Schema({ timestamps: true })
export class Transcription {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop()
  audioFile?: string;
}

export const TranscriptionSchema = SchemaFactory.createForClass(Transcription);
