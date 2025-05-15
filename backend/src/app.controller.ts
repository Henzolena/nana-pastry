import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  [x: string]: any;
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiStatus() {
    return {
      status: 'ok',
      message: 'Nana Pastry API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
