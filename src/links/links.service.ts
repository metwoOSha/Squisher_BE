import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LinkDto } from './dto/link.dto.js';
import { LinkWithClicksDto } from './dto/link-with-clicks.dto.js';
import { nanoid } from 'nanoid';

const PUBLIC_LINK_FIELDS = {
    id: true,
    shortCode: true,
    originalUrl: true,
    createdAt: true,
} as const;

type Owner = { userId: string } | { anonId: string };

function ownerOf(anonId?: string, userId?: string): Owner | null {
    if (userId) return { userId };
    if (anonId) return { anonId };
    return null;
}

@Injectable()
export class LinksService {
    constructor(private readonly prisma: PrismaService) {}

    async create(originalUrl: string, anonId: string, userId?: string): Promise<LinkDto> {
        const owner = ownerOf(anonId, userId) as Owner;

        const existing = await this.prisma.link.findFirst({
            where: { originalUrl, ...owner },
            select: PUBLIC_LINK_FIELDS,
        });

        if (existing) return existing;

        return this.prisma.link.create({
            data: { originalUrl, shortCode: nanoid(7), anonId, userId },
            select: PUBLIC_LINK_FIELDS,
        });
    }

    async findByShortCode(shortCode: string) {
        const link = await this.prisma.link.findUnique({
            where: { shortCode },
            select: { id: true, originalUrl: true },
        });

        if (!link) throw new NotFoundException();

        await this.prisma.click.create({ data: { linkId: link.id } });

        return link;
    }

    async findStatsByShortCode(shortCode: string) {
        const link = await this.prisma.link.findUnique({
            where: { shortCode },
            select: { id: true, originalUrl: true },
        });

        if (!link) throw new NotFoundException();

        const totalClicks = await this.prisma.click.count({ where: { linkId: link.id } });

        return { shortCode, originalUrl: link.originalUrl, totalClicks };
    }

    async findMyLinks(anonId?: string, userId?: string): Promise<LinkWithClicksDto[]> {
        const owner = ownerOf(anonId, userId);

        if (!owner) return [];

        const links = await this.prisma.link.findMany({
            where: owner,
            select: { ...PUBLIC_LINK_FIELDS, _count: { select: { clicks: true } } },
            orderBy: { createdAt: 'desc' },
        });

        return links.map(({ _count, ...link }) => ({ ...link, clicks: _count.clicks }));
    }
}
