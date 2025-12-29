/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, MinLength } from 'class-validator';

export class CreateTranscriptionDto {
  @IsString()
  @MinLength(1)
  text: string;
}
