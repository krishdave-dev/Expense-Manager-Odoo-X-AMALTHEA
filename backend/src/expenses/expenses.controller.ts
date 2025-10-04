// src/expenses/expenses.controller.ts
import { Body, Controller, Get, Post, Request, UseGuards, Param, ParseIntPipe, Patch } from '@nestjs/common';
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

  @Get('my')
  getMy(@CurrentUser() user: any) {
    return this.expensesService.getMyExpenses(user.id);
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
}