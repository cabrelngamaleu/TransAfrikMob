import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export enum BillType {
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  INTERNET = 'INTERNET',
  TV = 'TV',
}

export class PayBillDto {
  @IsEnum(BillType)
  billType: BillType;

  @IsString()
  providerId: string;

  @IsString()
  accountNumber: string;

  @IsNumber()
  @Min(100)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'XOF';
}

export class GetProvidersDto {
  @IsEnum(BillType)
  billType: BillType;

  @IsString()
  @IsOptional()
  country?: string;
}

export class ValidateAccountDto {
  @IsString()
  providerId: string;

  @IsString()
  accountNumber: string;
}
