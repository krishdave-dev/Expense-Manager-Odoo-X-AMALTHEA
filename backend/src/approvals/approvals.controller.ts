// src/approvals/approvals.controller.ts
import { Body, Controller, Get, Param, Post, Request, UseGuards, Delete, Patch, ParseIntPipe } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
import { CreateApprovalFlowDto, UpdateApprovalFlowDto } from './dto/approval-flow.dto';
import { CreateApprovalRuleDto, UpdateApprovalRuleDto } from './dto/approval-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Post(':expenseId/approve')
  approve(@Param('expenseId') expenseId: string, @Body() dto: ApproveExpenseDto, @CurrentUser() user: any) {
    return this.approvalsService.approveExpense(+expenseId, user.id, dto);
  }

  @Get('pending')
  getPending(@CurrentUser() user: any) {
    return this.approvalsService.getPendingApprovals(user.id);
  }

  @Post('setup-flow/:companyId')
  async setupApprovalFlow(@Param('companyId') companyId: string) {
    return this.approvalsService.setupDefaultApprovalFlow(+companyId);
  }

  @Get('debug/all')
  async getAllApprovals() {
    return this.approvalsService.getAllApprovalsDebug();
  }

  /**
   * Get company approval flows (Admin only)
   */
  @Get('flows')
  @Roles(Role.ADMIN)
  getApprovalFlows(@CurrentUser() user: any) {
    return this.approvalsService.getApprovalFlows(user.id);
  }

  /**
   * Create approval flow (Admin only)
   */
  @Post('flows')
  @Roles(Role.ADMIN)
  createApprovalFlow(@CurrentUser() user: any, @Body() flowData: CreateApprovalFlowDto) {
    return this.approvalsService.createApprovalFlow(user.id, flowData);
  }

  /**
   * Update approval flow (Admin only)
   */
  @Patch('flows/:id')
  @Roles(Role.ADMIN)
  updateApprovalFlow(
    @Param('id', ParseIntPipe) flowId: number,
    @CurrentUser() user: any,
    @Body() flowData: UpdateApprovalFlowDto
  ) {
    return this.approvalsService.updateApprovalFlow(flowId, user.id, flowData);
  }

  /**
   * Delete approval flow (Admin only)
   */
  @Delete('flows/:id')
  @Roles(Role.ADMIN)
  deleteApprovalFlow(@Param('id', ParseIntPipe) flowId: number, @CurrentUser() user: any) {
    return this.approvalsService.deleteApprovalFlow(flowId, user.id);
  }

  /**
   * Get approval rules (Admin only)
   */
  @Get('rules')
  @Roles(Role.ADMIN)
  getApprovalRules(@CurrentUser() user: any) {
    return this.approvalsService.getApprovalRules(user.id);
  }

  /**
   * Create approval rule (Admin only)
   */
  @Post('rules')
  @Roles(Role.ADMIN)
  createApprovalRule(@CurrentUser() user: any, @Body() ruleData: CreateApprovalRuleDto) {
    return this.approvalsService.createApprovalRule(user.id, ruleData);
  }

  /**
   * Update approval rule (Admin only)
   */
  @Patch('rules/:id')
  @Roles(Role.ADMIN)
  updateApprovalRule(
    @Param('id', ParseIntPipe) ruleId: number,
    @CurrentUser() user: any,
    @Body() ruleData: UpdateApprovalRuleDto
  ) {
    return this.approvalsService.updateApprovalRule(ruleId, user.id, ruleData);
  }

  /**
   * Delete approval rule (Admin only)
   */
  @Delete('rules/:id')
  @Roles(Role.ADMIN)
  deleteApprovalRule(@Param('id', ParseIntPipe) ruleId: number, @CurrentUser() user: any) {
    return this.approvalsService.deleteApprovalRule(ruleId, user.id);
  }
}