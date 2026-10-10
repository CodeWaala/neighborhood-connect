import { Controller, Get, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('availability')
@UseGuards(AuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('windows')
  async listWindows() {
    return this.availabilityService.listWindows();
  }
}
