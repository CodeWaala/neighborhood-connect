import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { RegisterDeviceDto } from './devices.dto';

@Controller('devices')
@UseGuards(AuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  async register(@CurrentUserId() userId: string | undefined, @Body() body: RegisterDeviceDto) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.devicesService.registerDevice(userId, body.token, body.platform);
  }
}
