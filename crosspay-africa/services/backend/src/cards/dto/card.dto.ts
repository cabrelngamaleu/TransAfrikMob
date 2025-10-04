import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateCardDto {
  @IsString()
  cardholderName: string;

  @IsNumber()
  @Min(10000)
  spendingLimit: number;

  @IsString()
  @IsOptional()
  currency?: string = 'XOF';
}

export class UpdateCardLimitDto {
  @IsNumber()
  @Min(0)
  spendingLimit: number;
}

export enum CardAction {
  FREEZE = 'FREEZE',
  UNFREEZE = 'UNFREEZE',
  CANCEL = 'CANCEL',
}

export class CardActionDto {
  @IsEnum(CardAction)
  action: CardAction;
}

export class AddToWalletDto {
  @IsEnum(['APPLE_PAY', 'GOOGLE_PAY'])
  walletType: 'APPLE_PAY' | 'GOOGLE_PAY';

  @IsString()
  deviceId: string;
}
