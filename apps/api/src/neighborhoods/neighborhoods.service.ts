import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NeighborhoodsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string) {
    if (!query.trim()) {
      return [];
    }
    return this.prisma.neighborhood.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { region: { contains: query, mode: 'insensitive' } },
          { postalCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    return this.prisma.neighborhood.findUnique({ where: { id } });
  }
}
