import { IsIn, IsOptional, IsString } from 'class-validator';

export class ApproveExpenseDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  comments?: string;
}