import { Controller, Get, All, Req, Res } from '@nestjs/common';
import { AppService } from './app.service'
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @All('*')
  handleInvalidRoute(@Req() req: Request, @Res() res: Response) {
    return res.status(404).json({
      message: 'Not found',
    });
  }
}
