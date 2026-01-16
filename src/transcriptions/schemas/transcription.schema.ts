import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TranscriptionDocument = Transcription & Document;

@Schema({ timestamps: true })
export class Transcription {
  @Prop({ required: true })
  userId: string; // Must match the field name here

  @Prop({ required: true })
  fileName: string; // Must match the field name here

  @Prop()
  text?: string; // Optional
}

export const TranscriptionSchema = SchemaFactory.createForClass(Transcription);
