import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { NeighborhoodsService } from './neighborhoods.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('neighborhoods')
@UseGuards(AuthGuard)
export class NeighborhoodsController {
  constructor(private readonly neighborhoodsService: NeighborhoodsService) {}

  @Get('search')
  async search(@Query('q') query?: string) {
    return this.neighborhoodsService.search(query ?? '');
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.neighborhoodsService.getById(id);
  }
}
