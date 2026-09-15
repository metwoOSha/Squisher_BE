import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class CreateLinkDto {
    @ApiProperty({ description: 'Original Url', example: 'https://www.google.com.ua/' })
    @IsNotEmpty({ message: 'originalUrl must not be empty' })
    @IsUrl({}, { message: 'originalUrl must be a valid URL' })
    @MaxLength(2048, { message: 'originalUrl must not exceed 2048 characters' })
    originalUrl: string;
}
