import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user-id.decorator';

@Controller('discovery')
@UseGuards(AuthGuard)
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get()
  async listMatches(
    @CurrentUserId() userId?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('includeConnected') includeConnected?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.discoveryService.listMatches(userId, {
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
      role,
      includeConnected: includeConnected === 'true',
    });
  }
}
