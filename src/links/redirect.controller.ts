import { Controller, Get, Next, Param, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { NextFunction, Response } from 'express';
import { LinksService } from './links.service.js';

const SHORT_CODE = /^[A-Za-z0-9_-]{7}$/;

@ApiExcludeController()
@Controller()
export class RedirectController {
    constructor(private readonly linksService: LinksService) {}

    @Get(':shortCode')
    async redirect(@Param('shortCode') shortCode: string, @Res() res: Response, @Next() next: NextFunction) {
        if (!SHORT_CODE.test(shortCode)) return next();

        try {
            const link = await this.linksService.findByShortCode(shortCode);
            res.redirect(302, link.originalUrl);
        } catch {
            next();
        }
    }
}
