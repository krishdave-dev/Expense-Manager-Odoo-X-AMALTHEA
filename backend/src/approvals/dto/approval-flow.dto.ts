import { IsEnum, IsOptional, IsNumber, IsBoolean, IsObject, Min, Max } from 'class-validator';
import { ApproverRole } from '@prisma/client';

export class CreateApprovalFlowDto {
  @IsNumber()
  @Min(1)
  stepOrder: number;

  @IsEnum(ApproverRole)
  approverRole: ApproverRole;

  @IsOptional()
  @IsNumber()
  specificUserId?: number;

  @IsOptional()
  @IsBoolean()
  isManagerApprover?: boolean;
}

export class UpdateApprovalFlowDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  stepOrder?: number;

  @IsOptional()
  @IsEnum(ApproverRole)
  approverRole?: ApproverRole;

  @IsOptional()
  @IsNumber()
  specificUserId?: number;

  @IsOptional()
  @IsBoolean()
  isManagerApprover?: boolean;
}