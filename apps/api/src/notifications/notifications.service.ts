import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Expo, type ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

/** What the app does when the notification is tapped. */
export type PushData =
  | { type: 'connection_request'; connectionId: string }
  | { type: 'connection_accepted'; connectionId: string }
  | { type: 'message'; connectionId: string };

const MESSAGE_PREVIEW_LENGTH = 80;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly expo = new Expo({
    // Optional: only needed if "Enhanced security for push notifications" is on in the Expo project
    accessToken: process.env.EXPO_ACCESS_TOKEN || undefined,
  });

  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────
  // Device tokens
  // ──────────────────────────────────────────────

  /** Save (or move to this user) an Expo push token. */
  async registerDevice(userId: string, token: string, platform: string) {
    if (!Expo.isExpoPushToken(token)) {
      throw new BadRequestException('Not an Expo push token');
    }
    await this.prisma.deviceToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform, lastSeenAt: new Date() },
    });
  }

  /** Remove a token on sign-out. Only the owner can remove it; unknown tokens are ignored. */
  async unregisterDevice(userId: string, token: string) {
    await this.prisma.deviceToken.deleteMany({ where: { userId, token } });
  }

  // ──────────────────────────────────────────────
  // Triggers (call after the DB write; they never throw)
  // ──────────────────────────────────────────────

  async notifyConnectionRequest(connection: {
    id: string;
    requesterId: string;
    recipientId: string;
  }) {
    const name = await this.displayName(connection.requesterId);
    await this.send(connection.recipientId, {
      title: 'New connection request',
      body: `${name} wants to connect`,
      data: { type: 'connection_request', connectionId: connection.id },
    });
  }

  /** `accepterId` accepted; tell the other person. */
  async notifyConnectionAccepted(
    connection: { id: string; requesterId: string; recipientId: string },
    accepterId: string,
  ) {
    const otherId =
      connection.requesterId === accepterId
        ? connection.recipientId
        : connection.requesterId;
    const name = await this.displayName(accepterId);
    await this.send(otherId, {
      title: 'Request accepted',
      body: `${name} accepted — say hello`,
      data: { type: 'connection_accepted', connectionId: connection.id },
    });
  }

  async notifyMessage(
    message: { connectionId: string; senderId: string; body: string },
    connection: { requesterId: string; recipientId: string },
  ) {
    const recipientId =
      connection.requesterId === message.senderId
        ? connection.recipientId
        : connection.requesterId;
    const name = await this.displayName(message.senderId);
    const preview =
      message.body.length > MESSAGE_PREVIEW_LENGTH
        ? `${message.body.slice(0, MESSAGE_PREVIEW_LENGTH).trimEnd()}…`
        : message.body;
    await this.send(recipientId, {
      title: name,
      body: preview,
      data: { type: 'message', connectionId: message.connectionId },
    });
  }

  // ──────────────────────────────────────────────
  // Sending
  // ──────────────────────────────────────────────

  private async displayName(userId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { displayName: true },
    });
    return profile?.displayName ?? 'A neighbor';
  }

  /** Push to every device of `userId`. Logs and swallows all errors. */
  private async send(
    userId: string,
    content: { title: string; body: string; data: PushData },
  ) {
    try {
      const devices = await this.prisma.deviceToken.findMany({
        where: { userId },
        select: { token: true },
      });
      const messages: ExpoPushMessage[] = devices
        .filter((d) => Expo.isExpoPushToken(d.token))
        .map((d) => ({ to: d.token, sound: 'default', ...content }));
      if (messages.length === 0) return;

      const staleTokens: string[] = [];
      for (const chunk of this.expo.chunkPushNotifications(messages)) {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        // Tickets come back in the same order as the messages
        tickets.forEach((ticket, i) => {
          if (ticket.status === 'error') {
            if (ticket.details?.error === 'DeviceNotRegistered') {
              staleTokens.push(chunk[i].to as string);
            } else {
              this.logger.warn(`Push to ${userId} failed: ${ticket.message}`);
            }
          }
        });
      }

      if (staleTokens.length > 0) {
        await this.prisma.deviceToken.deleteMany({
          where: { token: { in: staleTokens } },
        });
      }
    } catch (error) {
      this.logger.warn(
        `Push to ${userId} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
