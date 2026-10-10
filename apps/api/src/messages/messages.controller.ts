import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { CreateMessageDto } from './messages.dto';

@Controller('connections/:connectionId/messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async list(
    @CurrentUserId() userId: string | undefined,
    @Param('connectionId') connectionId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.messagesService.listMessages(connectionId, userId);
  }

  @Post()
  async create(
    @CurrentUserId() userId: string | undefined,
    @Param('connectionId') connectionId: string,
    @Body() body: CreateMessageDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.messagesService.sendMessage(connectionId, userId, body.body);
  }
}
