import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  getHello(): object {
    return {
      message: 'Welcome to eCommerce CMS Backend API',
      version: '1.0.0',
      environment: this.configService.get<string>('app.nodeEnv'),
    };
  }

  @Get('health')
  healthCheck(): object {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
