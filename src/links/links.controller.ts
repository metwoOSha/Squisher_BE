import { Body, Controller, Get, Param, Post, Redirect, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LinksService } from './links.service.js';
import { CreateLinkDto } from './dto/create-link.dto.js';
import { LinkDto } from './dto/link.dto.js';
import { LinkWithClicksDto } from './dto/link-with-clicks.dto.js';
import type { Response, Request } from 'express';
import { nanoid } from 'nanoid';
import { AuthService } from '../auth/auth.service.js';
import { anonCookieOptions } from '../config/cookie.config.js';

@ApiTags('Links')
@Controller('links')
export class LinksController {
    constructor(
        private readonly linksService: LinksService,
        private readonly authService: AuthService
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a shortened link' })
    @ApiResponse({ status: 201, description: 'Link created (or the caller’s existing one returned)', type: LinkDto })
    async create(@Body() dto: CreateLinkDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        let anonId = req.cookies.anonId;

        if (!anonId) {
            anonId = nanoid(7);
            res.cookie('anonId', anonId, anonCookieOptions());
        }

        const userId = this.authService.tryGetUserIdFromToken(req.cookies.token);

        return this.linksService.create(dto.originalUrl, anonId, userId);
    }

    @Get(':shortCode')
    @Redirect()
    @ApiOperation({ summary: 'Redirect to the original URL and record a click' })
    @ApiParam({ name: 'shortCode', description: 'The short code of the link' })
    @ApiResponse({ status: 302, description: 'Redirects to the original URL' })
    @ApiResponse({ status: 404, description: 'Link not found' })
    async findByShortCode(@Param('shortCode') shortCode: string) {
        const link = await this.linksService.findByShortCode(shortCode);
        return { url: link.originalUrl };
    }

    @Get(':shortCode/stats')
    @ApiOperation({ summary: 'Get click statistics for a link' })
    @ApiParam({ name: 'shortCode', description: 'The short code of the link' })
    @ApiResponse({ status: 200, description: 'Link statistics' })
    @ApiResponse({ status: 404, description: 'Link not found' })
    async findStatsByShortCode(@Param('shortCode') shortCode: string) {
        return await this.linksService.findStatsByShortCode(shortCode);
    }

    @Get()
    @ApiOperation({ summary: 'Get links owned by the current user or anonymous session' })
    @ApiResponse({ status: 200, description: 'List of links with their click counts', type: [LinkWithClicksDto] })
    async findAll(@Req() req: Request) {
        const userId = this.authService.tryGetUserIdFromToken(req.cookies.token);
        const anonId = req.cookies.anonId;
        return this.linksService.findMyLinks(anonId, userId);
    }
}
