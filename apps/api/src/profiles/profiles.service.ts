import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProfileRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ProfileUpsertInput = {
  displayName?: string;
  bio?: string;
  role?: ProfileRole | string;
  neighborhoodId?: string;
  avatarUrl?: string;
  isProfilePublic?: boolean;
  childAgeRange?: string;
};

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) { }

  async getMyProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        neighborhood: true,
        children: true,
        pets: true,
        user: {
          select: {
            interests: { include: { interest: true } },
            availability: { include: { availabilityWindow: true } },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        neighborhood: true,
        children: true,
        pets: true,
        user: {
          select: {
            interests: { include: { interest: true } },
            availability: { include: { availabilityWindow: true } },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async upsertProfile(userId: string, data: ProfileUpsertInput) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } });

    if (!existing) {
      const requiredFields = ['displayName', 'role', 'neighborhoodId'];
      for (const field of requiredFields) {
        if (!(field in data)) {
          throw new BadRequestException(`Missing required field: ${field}`);
        }
      }
      const role = data.role as ProfileRole;
      if (!role) {
        throw new BadRequestException('Missing required field: role');
      }
      const created = await this.prisma.profile.create({
        data: {
          userId,
          displayName: data.displayName as string,
          role,
          neighborhoodId: data.neighborhoodId as string,
          bio: data.bio as string | null,
          avatarUrl: data.avatarUrl as string | null,
          isProfilePublic: (data.isProfilePublic as boolean | undefined) ?? true,
        },
      });
      await this.replaceChildAgeRange(userId, data.childAgeRange);
      return created;
    }

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        role: data.role as ProfileRole | undefined,
        avatarUrl: data.avatarUrl,
        isProfilePublic: data.isProfilePublic,
        neighborhoodId: data.neighborhoodId,
      },
    });
    await this.replaceChildAgeRange(userId, data.childAgeRange);
    return updated;
  }

  /**
   * One child age range per profile for now. `undefined` leaves it alone;
   * an empty string clears it.
   */
  private async replaceChildAgeRange(
    userId: string,
    ageRange: string | undefined,
  ) {
    if (ageRange === undefined) {
      return;
    }
    const trimmed = ageRange.trim();
    await this.prisma.$transaction([
      this.prisma.child.deleteMany({ where: { profileId: userId } }),
      ...(trimmed
        ? [
            this.prisma.child.create({
              data: { profileId: userId, ageRange: trimmed },
            }),
          ]
        : []),
    ]);
  }

  async replaceInterests(userId: string, interestIds: string[]) {
    await this.prisma.userInterest.deleteMany({ where: { userId } });
    if (interestIds.length === 0) {
      return [];
    }
    await this.prisma.userInterest.createMany({
      data: interestIds.map((interestId) => ({ userId, interestId })),
      skipDuplicates: true,
    });
    return this.prisma.userInterest.findMany({
      where: { userId },
      include: { interest: true },
    });
  }

  async replaceAvailability(
    userId: string,
    entries: { availabilityId: string; dayOfWeek: string }[],
  ) {
    await this.prisma.userAvailability.deleteMany({ where: { userId } });
    if (entries.length === 0) {
      return [];
    }
    await this.prisma.userAvailability.createMany({
      data: entries.map((entry) => ({
        userId,
        availabilityId: entry.availabilityId,
        dayOfWeek: entry.dayOfWeek as Prisma.UserAvailabilityCreateManyInput['dayOfWeek'],
      })),
      skipDuplicates: true,
    });
    return this.prisma.userAvailability.findMany({
      where: { userId },
      include: { availabilityWindow: true },
    });
  }
}
