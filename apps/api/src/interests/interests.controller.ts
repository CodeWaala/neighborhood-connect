import { Controller, Get, UseGuards } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('interests')
@UseGuards(AuthGuard)
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  async list() {
    return this.interestsService.listInterests();
  }
}
