import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'; // Import dotenv
import { ValidationPipe } from '@nestjs/common';

// Load environment variables from the .env file in the backend directory
// This must be at the very top of the file before importing any other modules
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS - allow frontend to communicate with the backend
  // Parse comma-separated origins into an array
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:5173'];
    
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  
  // Add global validation pipe for all endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      transform: true, // Auto-transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw errors on non-whitelisted properties
    }),
  );
  
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`Application is running on: http://localhost:${process.env.PORT || 3000}`);
}
bootstrap();
