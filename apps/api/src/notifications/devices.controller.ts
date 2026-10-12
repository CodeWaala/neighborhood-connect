import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { RegisterDeviceDto } from './devices.dto';
import { NotificationsService } from './notifications.service';

/** Push notification device tokens for the current user. */
@Controller('devices')
@UseGuards(AuthGuard)
export class DevicesController {
  constructor(private readonly notifications: NotificationsService) {}

  /** Register or refresh this device's Expo push token. */
  @Post()
  @HttpCode(204)
  async register(
    @CurrentUserId() userId: string | undefined,
    @Body() body: RegisterDeviceDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    await this.notifications.registerDevice(userId, body.token, body.platform);
  }

  /** Forget this device's token (on sign-out). */
  @Delete(':token')
  @HttpCode(204)
  async unregister(
    @CurrentUserId() userId: string | undefined,
    @Param('token') token: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    await this.notifications.unregisterDevice(userId, token);
  }
}
