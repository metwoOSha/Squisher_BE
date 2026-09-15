import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LinkDto } from './dto/link.dto.js';
import { nanoid } from 'nanoid';

@Injectable()
export class LinksService {
    constructor(private readonly prisma: PrismaService) {}

    async create(originalUrl: string, anonId: string, userId?: string): Promise<LinkDto> {
        const existingUrl = await this.prisma.link.findFirst({
            where: { originalUrl },
        });

        if (existingUrl) return existingUrl;

        const shortCode = nanoid(7);

        return this.prisma.link.create({
            data: { originalUrl, shortCode, anonId, userId },
        });
    }

    async findByShortCode(shortCode: string) {
        const link = await this.prisma.link.findUnique({
            where: {
                shortCode,
            },
        });

        if (!link) throw new NotFoundException();

        await this.prisma.click.create({ data: { linkId: link.id } });

        return link;
    }

    async findStatsByShortCode(shortCode: string) {
        const link = await this.prisma.link.findUnique({
            where: {
                shortCode,
            },
        });

        if (!link) throw new NotFoundException();

        const totalClicks = await this.prisma.click.count({
            where: {
                linkId: link.id,
            },
        });

        return {
            shortCode,
            originalUrl: link.originalUrl,
            totalClicks,
        };
    }

    async findMyLinks(anonId?: string, userId?: string) {
        if (userId) {
            return await this.prisma.link.findMany({
                where: {
                    userId,
                },
            });
        }

        if (anonId) {
            return await this.prisma.link.findMany({
                where: {
                    anonId,
                },
            });
        }

        return await this.prisma.link.findMany();
    }
}
