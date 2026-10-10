import { BadRequestException, Body, Controller, Get, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { ReplaceAvailabilityDto, ReplaceInterestsDto, UpdateProfileDto } from './profiles.dto';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async getMyProfile(@CurrentUserId() userId?: string) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.profilesService.getMyProfile(userId);
  }

  @Patch()
  async updateProfile(@CurrentUserId() userId: string | undefined, @Body() body: UpdateProfileDto) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.profilesService.upsertProfile(userId, body);
  }

  @Get(':id')
  async getProfileById(@Param('id') id: string) {
    return this.profilesService.getProfileByUserId(id);
  }

  @Put('interests')
  async replaceInterests(
    @CurrentUserId() userId: string | undefined,
    @Body() body: ReplaceInterestsDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.profilesService.replaceInterests(userId, body.interestIds);
  }

  @Put('availability')
  async replaceAvailability(
    @CurrentUserId() userId: string | undefined,
    @Body() body: ReplaceAvailabilityDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Missing user');
    }
    return this.profilesService.replaceAvailability(userId, body.availability);
  }
}
