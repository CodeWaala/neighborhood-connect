import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async listMessages(connectionId: string, userId: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id: connectionId } });
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }
    if (connection.status !== 'accepted') {
      throw new BadRequestException('Connection not accepted');
    }
    if (connection.requesterId !== userId && connection.recipientId !== userId) {
      throw new BadRequestException('Not allowed');
    }

    return this.prisma.message.findMany({
      where: { connectionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(connectionId: string, userId: string, body: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id: connectionId } });
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }
    if (connection.status !== 'accepted') {
      throw new BadRequestException('Connection not accepted');
    }
    if (connection.requesterId !== userId && connection.recipientId !== userId) {
      throw new BadRequestException('Not allowed');
    }

    return this.prisma.message.create({
      data: {
        connectionId,
        senderId: userId,
        body,
      },
    });
  }
}
