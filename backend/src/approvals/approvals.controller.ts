// src/approvals/approvals.controller.ts
import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApproveExpenseDto } from './dto/approve-expense.dto';

@Controller('approvals')
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Post(':expenseId/approve')
  approve(@Param('expenseId') expenseId: string, @Body() dto: ApproveExpenseDto, @Request() req) {
    const approverId = 1; // TODO: replace with req.user.id (using admin user for now)
    return this.approvalsService.approveExpense(+expenseId, approverId, dto);
  }

  @Get('pending')
  getPending(@Request() req) {
    const approverId = 1; // TODO: replace with req.user.id (using admin user for now)
    return this.approvalsService.getPendingApprovals(approverId);
  }

  @Post('setup-flow/:companyId')
  async setupApprovalFlow(@Param('companyId') companyId: string) {
    return this.approvalsService.setupDefaultApprovalFlow(+companyId);
  }

  @Get('debug/all')
  async getAllApprovals() {
    return this.approvalsService.getAllApprovalsDebug();
  }
}