import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Squisher API')
    .setDescription('URL shortener with auth and click tracking')
    .setVersion('1.0')
    .build();
