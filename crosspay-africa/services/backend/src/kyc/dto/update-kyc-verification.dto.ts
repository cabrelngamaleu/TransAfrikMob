import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { CreateKycVerificationDto } from "./create-kyc-verification.dto";
import { VerificationStatus } from "../verification-status.enum";

export class UpdateKycVerificationDto extends PartialType(
  CreateKycVerificationDto
) {
  @IsEnum(VerificationStatus)
  @IsOptional()
  status?: VerificationStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsUUID()
  @IsOptional()
  verifiedBy?: string;
}
