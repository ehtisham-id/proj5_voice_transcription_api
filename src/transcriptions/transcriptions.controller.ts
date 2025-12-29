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
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranscriptionsService } from './transcriptions.service';
import { CreateTranscriptionDto } from './dto/create-transcription.dto';
import { EmailTranscriptionDto } from './dto/email-transcription.dto';
import { EmailService } from '../email/email.service';

@UseGuards(AuthGuard('jwt'))
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
  findOne(@Req() req, @Param('id') id: string) {
    return this.transcriptionsService.findOne(req.user.id, id);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.transcriptionsService.delete(id, req.user.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.transcriptionsService.create(
      req.user.id,
      'Audio transcription pending',
      file.filename,
    );
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

    return this.emailService.sendTranscription(dto.email, transcription.text);
  }
}
