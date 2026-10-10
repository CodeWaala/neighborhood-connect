import { IsEnum, IsUUID } from 'class-validator';
import { ConnectionStatus } from '@prisma/client';

export class CreateConnectionDto {
  @IsUUID()
  recipientId!: string;
}

export class UpdateConnectionDto {
  @IsEnum(ConnectionStatus)
  status!: ConnectionStatus;
}
