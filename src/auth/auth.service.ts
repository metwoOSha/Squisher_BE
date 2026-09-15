import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async register(dto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(dto.email);

        if (existingUser) throw new ConflictException('User already exists');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.usersService.create({
            email: dto.email,
            password: hashedPassword,
        });

        const token = this.generateToken(user.id);

        return token;
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const valid = await bcrypt.compare(dto.password, user.password);

        if (!valid) throw new UnauthorizedException('Invalid credentials');

        const token = this.generateToken(user.id);

        return token;
    }

    async me(userId: string) {
        return this.usersService.findById(userId);
    }

    tryGetUserIdFromToken(token: string | undefined): string | undefined {
        if (!token) return undefined;

        try {
            const payload = this.jwtService.verify<{ sub: string }>(token);
            return payload.sub;
        } catch {
            return undefined;
        }
    }

    private generateToken(userId: string) {
        return this.jwtService.sign({ sub: userId });
    }
}
