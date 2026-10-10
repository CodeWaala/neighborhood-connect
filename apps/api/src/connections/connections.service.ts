import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConnectionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const CONNECTION_PROFILE_SELECT = {
  requester: {
    select: {
      id: true,
      profile: {
        select: { displayName: true, bio: true, role: true, avatarUrl: true },
      },
    },
  },
  recipient: {
    select: {
      id: true,
      profile: {
        select: { displayName: true, bio: true, role: true, avatarUrl: true },
      },
    },
  },
};

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) { }

  async createConnection(requesterId: string, recipientId: string) {
    if (requesterId === recipientId) {
      throw new BadRequestException('Cannot connect to self');
    }

    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, recipientId },
          { requesterId: recipientId, recipientId: requesterId },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('A connection request already exists between these users');
    }

    return this.prisma.connection.create({
      data: { requesterId, recipientId },
    });
  }

  async listConnections(userId: string) {
    return this.prisma.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
      orderBy: { requestedAt: 'desc' },
      include: CONNECTION_PROFILE_SELECT,
    });
  }

  async getConnection(connectionId: string, userId: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id: connectionId },
      include: CONNECTION_PROFILE_SELECT,
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }
    if (connection.requesterId !== userId && connection.recipientId !== userId) {
      throw new BadRequestException('Not allowed');
    }

    return connection;
  }

  async updateConnectionStatus(connectionId: string, userId: string, status: ConnectionStatus) {
    const connection = await this.prisma.connection.findUnique({ where: { id: connectionId } });
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }
    if (connection.requesterId !== userId && connection.recipientId !== userId) {
      throw new BadRequestException('Not allowed');
    }

    return this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status,
        respondedAt: new Date(),
      },
      include: CONNECTION_PROFILE_SELECT,
    });
  }
}
