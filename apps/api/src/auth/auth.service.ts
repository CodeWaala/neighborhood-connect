import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async devLogin(email?: string) {
    const resolvedEmail = email?.trim() || `dev-${randomUUID()}@local.test`;
    const existing = await this.prisma.user.findFirst({
      where: { email: resolvedEmail },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.user.create({
      data: {
        authProvider: 'dev',
        authSubject: randomUUID(),
        email: resolvedEmail,
      },
    });
  }

  async me(userId?: string) {
    if (!userId) {
      return { ok: false };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return {
      ok: true,
      user,
    };
  }
}
