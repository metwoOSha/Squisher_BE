import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/auth.guard.js';
import type { Request, Response } from 'express';
import { authCookieOptions, clearCookieOptions } from '../config/cookie.config.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account and sets an httpOnly auth cookie.' })
    @ApiResponse({
        status: 201,
        description: 'User registered, auth cookie set',
        schema: { example: { message: 'Registered successfully' } },
    })
    @ApiResponse({ status: 400, description: 'Validation failed (invalid email or password too short)' })
    @ApiResponse({ status: 409, description: 'Email already in use' })
    @ApiResponse({ status: 429, description: 'Too many registration attempts, try again later' })
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const token = await this.authService.register(dto);
        this.setTokenCookie(res, token);
        return { message: 'Registered successfully' };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'Log in', description: 'Verifies credentials and sets an httpOnly auth cookie.' })
    @ApiResponse({ status: 200, description: 'Logged in, auth cookie set', schema: { example: { message: 'Logged in successfully' } } })
    @ApiResponse({ status: 401, description: 'Invalid email or password' })
    @ApiResponse({ status: 429, description: 'Too many login attempts, try again later' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const token = await this.authService.login(dto);
        this.setTokenCookie(res, token);
        return { message: 'Logged in successfully' };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Log out', description: 'Clears the auth cookie. Works even if the user is not currently authenticated.' })
    @ApiResponse({ status: 200, description: 'Auth cookie cleared', schema: { example: { message: 'Logged out successfully' } } })
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('token', clearCookieOptions());
        return { message: 'Logged out successfully' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Get the current authenticated user' })
    @ApiResponse({ status: 200, description: 'Current user data (id, email, createdAt — no password)' })
    @ApiResponse({ status: 401, description: 'Not authenticated (missing or invalid auth cookie)' })
    me(@Req() req: Request & { user: { userId: string } }) {
        return this.authService.me(req.user.userId);
    }

    private setTokenCookie(res: Response, token: string) {
        res.cookie('token', token, authCookieOptions());
    }
}
