import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token JWT à rafraîchir' })
  @IsString()
  @IsNotEmpty({ message: 'Le token est requis' })
  token: string;
}