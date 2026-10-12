import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConnectionStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectionsService } from './connections.service';

const REQUESTER = 'requester-id';
const RECIPIENT = 'recipient-id';
const STRANGER = 'stranger-id';

function setup(currentStatus: ConnectionStatus) {
  const connection = {
    id: 'conn-1',
    requesterId: REQUESTER,
    recipientId: RECIPIENT,
    status: currentStatus,
  };
  const prisma = {
    connection: {
      findUnique: jest.fn().mockResolvedValue(connection),
      update: jest
        .fn()
        .mockImplementation(
          ({ data }: { data: { status: ConnectionStatus } }) =>
            Promise.resolve({ ...connection, status: data.status }),
        ),
    },
  };
  const notifications = {
    notifyConnectionAccepted: jest.fn().mockResolvedValue(undefined),
  };
  const service = new ConnectionsService(
    prisma as unknown as PrismaService,
    notifications as unknown as NotificationsService,
  );
  return { service, prisma, notifications };
}

describe('ConnectionsService.updateConnectionStatus', () => {
  it('lets the recipient accept a pending request and notifies the requester', async () => {
    const { service, prisma, notifications } = setup('pending');
    await expect(
      service.updateConnectionStatus('conn-1', RECIPIENT, 'accepted'),
    ).resolves.toMatchObject({
      status: 'accepted',
    });
    expect(prisma.connection.update).toHaveBeenCalled();
    expect(notifications.notifyConnectionAccepted).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'conn-1' }),
      RECIPIENT,
    );
  });

  it('lets the recipient decline a pending request', async () => {
    const { service } = setup('pending');
    await expect(
      service.updateConnectionStatus('conn-1', RECIPIENT, 'declined'),
    ).resolves.toMatchObject({
      status: 'declined',
    });
  });

  it.each<[string, ConnectionStatus]>([
    ['accept', 'accepted'],
    ['decline', 'declined'],
  ])(
    'does not let the requester %s their own request',
    async (_verb, status) => {
      const { service, prisma, notifications } = setup('pending');
      await expect(
        service.updateConnectionStatus('conn-1', REQUESTER, status),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.connection.update).not.toHaveBeenCalled();
      expect(notifications.notifyConnectionAccepted).not.toHaveBeenCalled();
    },
  );

  it('rejects people outside the connection', async () => {
    const { service, prisma } = setup('pending');
    await expect(
      service.updateConnectionStatus('conn-1', STRANGER, 'accepted'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.connection.update).not.toHaveBeenCalled();
  });

  it.each<[ConnectionStatus, ConnectionStatus]>([
    ['accepted', 'declined'],
    ['declined', 'accepted'],
    ['blocked', 'accepted'],
  ])('rejects changing an already %s request to %s', async (current, next) => {
    const { service, prisma } = setup(current);
    await expect(
      service.updateConnectionStatus('conn-1', RECIPIENT, next),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.connection.update).not.toHaveBeenCalled();
  });

  it('never allows setting a connection back to pending', async () => {
    const { service } = setup('declined');
    await expect(
      service.updateConnectionStatus('conn-1', RECIPIENT, 'pending'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([REQUESTER, RECIPIENT])(
    'lets either person block (%s)',
    async (userId) => {
      const { service } = setup('accepted');
      await expect(
        service.updateConnectionStatus('conn-1', userId, 'blocked'),
      ).resolves.toMatchObject({
        status: 'blocked',
      });
    },
  );
});
