import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek, ProfileRole } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(ProfileRole)
  role?: ProfileRole;

  @IsOptional()
  @IsUUID()
  neighborhoodId?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isProfilePublic?: boolean;

  /** Free-text age range of the user's child (e.g. "2-3 years"). Empty string clears it. */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  childAgeRange?: string;
}

export class ReplaceInterestsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  interestIds!: string[];
}

class AvailabilityEntryDto {
  @IsUUID()
  availabilityId!: string;

  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;
}

export class ReplaceAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityEntryDto)
  availability!: AvailabilityEntryDto[];
}
