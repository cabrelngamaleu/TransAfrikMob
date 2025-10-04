import { IsNotEmpty, IsNumber, IsString, IsPhoneNumber, Min, Max } from 'class-validator';

export class BuyAirtimeDto {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  @Max(100000)
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string; // XOF, GHS, NGN, etc.
}

export class GetOperatorsDto {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
