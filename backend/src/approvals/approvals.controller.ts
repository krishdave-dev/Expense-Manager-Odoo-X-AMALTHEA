// src/approvals/approvals.controller.ts
import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApproveExpenseDto } from './dto/approve-expense.dto';

@Controller('approvals')
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Post(':id')
  approve(@Param('id') expenseId: string, @Body() dto: ApproveExpenseDto, @Request() req) {
    const approverId = 2; // TODO: replace with req.user.id
    return this.approvalsService.approveExpense(+expenseId, approverId, dto);
  }

  @Get('pending')
  getPending(@Request() req) {
    const approverId = 2; // TODO: replace with req.user.id
    return this.approvalsService.getPendingApprovals(approverId);
  }
}