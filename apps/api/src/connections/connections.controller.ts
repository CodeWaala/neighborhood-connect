import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { CreateConnectionDto, UpdateConnectionDto } from './connections.dto';

@Controller('connections')
@UseGuards(AuthGuard)
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) { }

  @Post()
  async create(
    @CurrentUserId() userId: string | undefined,
    @Body() body: CreateConnectionDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.connectionsService.createConnection(userId, body.recipientId);
  }

  @Get()
  async list(@CurrentUserId() userId: string | undefined) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.connectionsService.listConnections(userId);
  }

  @Get(':id')
  async getById(
    @CurrentUserId() userId: string | undefined,
    @Param('id') id: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.connectionsService.getConnection(id, userId);
  }

  @Patch(':id')
  async updateStatus(
    @CurrentUserId() userId: string | undefined,
    @Param('id') id: string,
    @Body() body: UpdateConnectionDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.connectionsService.updateConnectionStatus(id, userId, body.status);
  }
}
