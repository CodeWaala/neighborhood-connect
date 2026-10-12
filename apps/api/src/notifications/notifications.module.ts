import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [DevicesController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
