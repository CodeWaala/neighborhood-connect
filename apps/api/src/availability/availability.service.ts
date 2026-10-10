import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async listWindows() {
    return this.prisma.availabilityWindow.findMany({
      orderBy: { label: 'asc' },
    });
  }
}
