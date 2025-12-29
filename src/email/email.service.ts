import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendTranscription(
    transcription: string,
    to: string = process.env.DUMMY_EMAIL_TO,
  ) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Welcome to Transcription Service',
        text: transcription,
      });

      return { success: true };
    } catch (error) {
      console.error('Email error:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
