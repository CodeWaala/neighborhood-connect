import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { ConnectionsModule } from './connections/connections.module';
import { NeighborhoodsModule } from './neighborhoods/neighborhoods.module';
import { AvailabilityModule } from './availability/availability.module';
import { InterestsModule } from './interests/interests.module';
import { ProfilesModule } from './profiles/profiles.module';
import { UsersModule } from './users/users.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    InterestsModule,
    AvailabilityModule,
    NeighborhoodsModule,
    ConnectionsModule,
    MessagesModule,
    DiscoveryModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
