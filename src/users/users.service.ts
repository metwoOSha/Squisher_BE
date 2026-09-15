import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async findByEmail(email: string) {
        return await this.prismaService.user.findUnique({ where: { email } });
    }

    async findById(id: string) {
        return await this.prismaService.user.findUnique({
            where: { id },
            select: { id: true, email: true, createdAt: true },
        });
    }

    async create(data: { email: string; password: string }) {
        return await this.prismaService.user.create({
            data,
            select: { id: true },
        });
    }
}
