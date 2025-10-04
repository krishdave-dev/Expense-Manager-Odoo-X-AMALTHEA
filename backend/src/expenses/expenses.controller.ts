// src/expenses/expenses.controller.ts
import { Body, Controller, Get, Post, Request, UseGuards, Param, ParseIntPipe, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.createExpense(user.id, dto);
  }

  @Post('draft')
  createDraft(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.createExpense(user.id, dto, true);
  }

  @Get('my')
  getMy(@CurrentUser() user: any) {
    return this.expensesService.getMyExpenses(user.id);
  }

  @Get('my/drafts')
  getMyDrafts(@CurrentUser() user: any) {
    return this.expensesService.getDraftExpenses(user.id);
  }

  @Get('my/drafts/total')
  getMyDraftsTotal(@CurrentUser() user: any) {
    return this.expensesService.getDraftExpensesTotal(user.id);
  }

  @Post(':id/submit')
  submitDraft(@Param('id', ParseIntPipe) expenseId: number, @CurrentUser() user: any) {
    return this.expensesService.submitDraftExpense(expenseId, user.id);
  }

  @Patch(':id')
  updateDraft(@Param('id', ParseIntPipe) expenseId: number, @Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.updateDraftExpense(expenseId, user.id, dto);
  }

  /**
   * Get all company expenses (Admin only)
   */
  @Get('all')
  @Roles(Role.ADMIN)
  getAllCompanyExpenses(@CurrentUser() user: any) {
    return this.expensesService.getAllCompanyExpenses(user.id);
  }

  /**
   * Get team expenses (Manager can view their team's expenses)
   */
  @Get('team')
  @Roles(Role.MANAGER, Role.ADMIN)
  getTeamExpenses(@CurrentUser() user: any) {
    return this.expensesService.getTeamExpenses(user.id, user.role);
  }

  /**
   * Debug endpoint to check manager relationships
   */
  @Get('debug/manager-info')
  @Roles(Role.MANAGER, Role.ADMIN)
  getManagerDebugInfo(@CurrentUser() user: any) {
    return this.expensesService.getManagerDebugInfo(user.id);
  }

  /**
   * Get expense by ID (Admin can view any, others only their own)
   */
  @Get(':id')
  getExpenseById(@Param('id', ParseIntPipe) expenseId: number, @CurrentUser() user: any) {
    return this.expensesService.getExpenseById(expenseId, user.id, user.role);
  }

  /**
   * Override expense approval (Admin only)
   */
  @Patch(':id/override-approval')
  @Roles(Role.ADMIN)
  overrideApproval(
    @Param('id', ParseIntPipe) expenseId: number,
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @Body('comments') comments: string,
    @CurrentUser() user: any
  ) {
    return this.expensesService.overrideApproval(expenseId, user.id, status, comments);
  }

  /**
   * Process receipt with OCR
   */
  @Post('ocr/process-receipt')
  @UseInterceptors(FileInterceptor('file'))
  processReceipt(
    @UploadedFile() file: any,
    @CurrentUser() user: any
  ) {
    return this.expensesService.processReceiptOCR(file, user.id);
  }
}