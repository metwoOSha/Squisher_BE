import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ description: 'User email', example: '[email protected]' })
    @IsEmail({}, { message: 'email must be a valid email address' })
    email: string;

    @ApiProperty({ description: 'User password (min 6 characters)', example: 'password123' })
    @IsString({ message: 'password must be a string' })
    @MinLength(6, { message: 'password must be at least 6 characters long' })
    password: string;
}
