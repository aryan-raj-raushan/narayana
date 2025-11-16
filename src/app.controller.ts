import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Welcome message', description: 'Returns API information and version' })
  @ApiResponse({ status: 200, description: 'API information returned successfully' })
  getHello(): object {
    return {
      message: 'Welcome to eCommerce CMS Backend API',
      version: '2.0.0',
      environment: this.configService.get<string>('app.nodeEnv'),
      documentation: '/api',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check', description: 'Returns application health status with memory and uptime information' })
  @ApiResponse({ status: 200, description: 'Health status returned successfully' })
  healthCheck(): object {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      environment: this.configService.get<string>('app.nodeEnv'),
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe', description: 'Checks if application is ready to serve traffic' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  readinessCheck(): object {
    return {
      ready: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe', description: 'Checks if application is alive' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  livenessCheck(): object {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }
}
