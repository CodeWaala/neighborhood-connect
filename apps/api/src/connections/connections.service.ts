import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConnectionStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) { }

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

    const connection = await this.prisma.connection.create({
      data: { requesterId, recipientId },
    });
    // Fire and forget: a failed push never fails the request
    void this.notifications.notifyConnectionRequest(connection);
    return connection;
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
    this.assertTransitionAllowed(connection, userId, status);

    const updated = await this.prisma.connection.update({
      where: { id: connectionId },
      data: {
        status,
        respondedAt: new Date(),
      },
      include: CONNECTION_PROFILE_SELECT,
    });
    if (status === 'accepted' && connection.status !== 'accepted') {
      void this.notifications.notifyConnectionAccepted(updated, userId);
    }
    return updated;
  }

  /**
   * - accepted / declined: only the recipient, and only while the request is pending
   * - blocked: either person, at any time
   * - pending: never (a request can't be reopened)
   */
  private assertTransitionAllowed(
    connection: {
      requesterId: string;
      recipientId: string;
      status: ConnectionStatus;
    },
    userId: string,
    status: ConnectionStatus,
  ) {
    if (status === 'blocked') {
      return;
    }
    if (status === 'pending') {
      throw new BadRequestException(
        'A connection cannot be set back to pending',
      );
    }
    if (connection.recipientId !== userId) {
      throw new ForbiddenException(
        'Only the recipient can accept or decline a request',
      );
    }
    if (connection.status !== 'pending') {
      throw new BadRequestException(
        `This request was already ${connection.status}`,
      );
    }
  }
}
