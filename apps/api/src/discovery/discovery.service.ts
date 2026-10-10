import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type DiscoveryOptions = {
  limit?: number;
  role?: string;
  includeConnected?: boolean;
};

@Injectable()
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async listMatches(userId: string, options: DiscoveryOptions = {}) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { neighborhoodId: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const interests = await this.prisma.userInterest.findMany({
      where: { userId },
      select: { interestId: true },
    });

    const availability = await this.prisma.userAvailability.findMany({
      where: { userId },
      select: { availabilityId: true, dayOfWeek: true },
    });

    const interestIds = interests.map((item) => item.interestId);
    const availabilityIds = availability.map((item) => item.availabilityId);
    const days = availability.map((item) => item.dayOfWeek);

    if (interestIds.length === 0 || availabilityIds.length === 0 || days.length === 0) {
      return [];
    }

    const excludedUserIds: string[] = [];
    if (!options.includeConnected) {
      const connections = await this.prisma.connection.findMany({
        where: {
          OR: [{ requesterId: userId }, { recipientId: userId }],
        },
        select: { requesterId: true, recipientId: true },
      });
      for (const connection of connections) {
        excludedUserIds.push(
          connection.requesterId === userId ? connection.recipientId : connection.requesterId,
        );
      }
    }

    const roleFilter = options.role as ProfileRole | undefined;

    return this.prisma.user.findMany({
      where: {
        id: { notIn: [userId, ...excludedUserIds] },
        profile: {
          neighborhoodId: profile.neighborhoodId,
          ...(roleFilter ? { role: roleFilter } : {}),
        },
        interests: { some: { interestId: { in: interestIds } } },
        availability: {
          some: {
            availabilityId: { in: availabilityIds },
            dayOfWeek: { in: days },
          },
        },
      },
      take: options.limit ?? 20,
      select: {
        id: true,
        profile: {
          select: {
            displayName: true,
            bio: true,
            role: true,
            avatarUrl: true,
            neighborhoodId: true,
          },
        },
        interests: {
          select: {
            interest: { select: { id: true, label: true } },
          },
        },
        availability: {
          select: {
            dayOfWeek: true,
            availabilityWindow: { select: { id: true, label: true, timeRange: true } },
          },
        },
      },
    });
  }
}
