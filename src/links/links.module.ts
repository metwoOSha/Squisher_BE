import { Module } from '@nestjs/common';
import { LinksService } from './links.service.js';
import { LinksController } from './links.controller.js';
import { RedirectController } from './redirect.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
    imports: [AuthModule],
    controllers: [LinksController, RedirectController],
    providers: [LinksService],
})
export class LinksModule {}
