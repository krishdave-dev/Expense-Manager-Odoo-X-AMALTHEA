import { IsEnum, IsOptional, IsNumber, IsObject, Min, Max } from 'class-validator';
import { RuleType } from '@prisma/client';

export class CreateApprovalRuleDto {
  @IsEnum(RuleType)
  ruleType: RuleType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  percentageThreshold?: number;

  @IsOptional()
  @IsNumber()
  specificApproverId?: number;

  @IsOptional()
  @IsObject()
  hybridCondition?: any;
}

export class UpdateApprovalRuleDto {
  @IsOptional()
  @IsEnum(RuleType)
  ruleType?: RuleType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  percentageThreshold?: number;

  @IsOptional()
  @IsNumber()
  specificApproverId?: number;

  @IsOptional()
  @IsObject()
  hybridCondition?: any;
}