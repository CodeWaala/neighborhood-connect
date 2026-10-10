import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InterestsService {
  constructor(private readonly prisma: PrismaService) {}

  async listInterests() {
    return this.prisma.interest.findMany({
      where: { isActive: true },
      orderBy: { label: 'asc' },
    });
  }
}
