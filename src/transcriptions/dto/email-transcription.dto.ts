/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail } from 'class-validator';

export class EmailTranscriptionDto {
  @IsEmail()
  email: string;
}
