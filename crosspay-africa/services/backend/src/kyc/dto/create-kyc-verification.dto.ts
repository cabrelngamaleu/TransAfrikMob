import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsNumber,
} from "class-validator";
import { DocumentType } from "../verification-status.enum";

export class CreateKycVerificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @IsDateString()
  @IsOptional()
  documentExpiryDate?: Date;

  @IsNumber()
  @IsOptional()
  verificationAmount?: number;

  @IsString()
  @IsOptional()
  documentIssuingCountry?: string;

  @IsString()
  @IsOptional()
  documentFrontImageUrl?: string;

  @IsString()
  @IsOptional()
  documentBackImageUrl?: string;

  @IsString()
  @IsOptional()
  selfieImageUrl?: string;

  @IsString()
  @IsOptional()
  addressProofImageUrl?: string;

  @IsBoolean()
  @IsOptional()
  addressVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  identityVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  faceMatchVerified?: boolean;
}
