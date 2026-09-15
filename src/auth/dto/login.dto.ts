import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({ description: 'User email', example: '[email protected]' })
    @IsEmail({}, { message: 'email must be a valid email address' })
    email: string;

    @ApiProperty({ description: 'User password', example: 'password123' })
    @IsString({ message: 'password must be a string' })
    @IsNotEmpty({ message: 'password must not be empty' })
    password: string;
}
