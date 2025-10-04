// src/expenses/expenses.controller.ts
import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto, @Request() req) {
    const employeeId = req.user?.id || req.user?.sub;
    if (!employeeId) {
      throw new Error('User not authenticated');
    }
    return this.expensesService.createExpense(employeeId, dto);
  }

  @Get('my')
  getMy(@Request() req) {
    const employeeId = req.user?.id || req.user?.sub;
    if (!employeeId) {
      throw new Error('User not authenticated');
    }
    return this.expensesService.getMyExpenses(employeeId);
  }
}