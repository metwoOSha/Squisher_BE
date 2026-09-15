import { ApiProperty } from '@nestjs/swagger';

export class LinkDto {
    @ApiProperty({ description: 'UUID', example: '937a960e-9532-4a37-a2ac-053ae96b2798' })
    id: string;

    @ApiProperty({ description: 'Short code', example: 'F21sXxB' })
    shortCode: string;

    @ApiProperty({ description: 'Original Url', example: 'https://www.google.com.ua/' })
    originalUrl: string;

    @ApiProperty({ description: 'Creation date', example: '2026-09-06T23:01:30.833Z' })
    createdAt: Date;
}
