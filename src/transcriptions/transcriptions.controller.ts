import {
  Controller,
  Body,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranscriptionsService } from './transcriptions.service';
import { CreateTranscriptionDto } from './dto/create-transcription.dto';
import { EmailTranscriptionDto } from './dto/email-transcription.dto';
import { EmailService } from '../email/email.service';

@UseGuards(JwtGuard)
@Controller('transcriptions')
export class TranscriptionsController {
  constructor(
    private readonly transcriptionsService: TranscriptionsService,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  create(@Req() req, @Body() dto: CreateTranscriptionDto) {
    return this.transcriptionsService.create(req.user.id, dto.text);
  }

  @Get()
  findAll(@Req() req) {
    return this.transcriptionsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.transcriptionsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.transcriptionsService.delete(id, req.user.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.transcriptionsService.uploadAndTranscribe(file, req.user.id);
  }

  @Post(':id/email')
  async email(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: EmailTranscriptionDto,
  ) {
    const transcription = await this.transcriptionsService.findOne(
      id,
      req.user.id,
    );
    if (!transcription) throw new Error('Transcription not found');
    return this.emailService.sendTranscription(dto.email, transcription.text);
  }
}
