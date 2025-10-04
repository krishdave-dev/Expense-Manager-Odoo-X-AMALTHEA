// src/expenses/expenses.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private exchangeRatesService: ExchangeRatesService,
  ) {}

  async createExpense(employeeId: number, dto: CreateExpenseDto) {
    const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
    const company = await this.prisma.company.findUnique({ where: { id: employee.company_id } });

    let convertedAmount = dto.amount;
    if (dto.currency_code !== company.currency_code) {
      convertedAmount = await this.exchangeRatesService.convertAmount(
        dto.amount,
        dto.currency_code,
        company.currency_code,
      );
    }

    const expense = await this.prisma.expense.create({
      data: {
        ...dto,
        employee_id: employeeId,
        company_id: company.id,
        converted_amount: convertedAmount,
        date: new Date(dto.date),
      },
    });

    // Trigger approval workflow
    await this.prisma.$transaction(async (tx) => {
      const flows = await tx.approvalFlow.findMany({
        where: { company_id: company.id },
        orderBy: { step_order: 'asc' },
      });

      // If no approval flows exist, create a default one with the admin user
      if (flows.length === 0) {
        const adminUser = await tx.user.findFirst({
          where: { company_id: company.id, role: 'ADMIN' },
        });
        
        if (adminUser) {
          await tx.expenseApproval.create({
            data: {
              expense_id: expense.id,
              approver_id: adminUser.id,
              step_order: 1,
              status: 'PENDING',
            },
          });
        }
      } else {
        // Process existing approval flows
        for (const flow of flows) {
          let approverId: number | null = null;

          if (flow.is_manager_approver) {
            // For now, assume employee's manager = company admin (simplified)
            const manager = await tx.user.findFirst({
              where: { company_id: company.id, role: 'MANAGER' },
            });
            if (manager) approverId = manager.id;
          } else if (flow.specific_user_id) {
            approverId = flow.specific_user_id;
          } else {
            const user = await tx.user.findFirst({
              where: { company_id: company.id, role: flow.approver_role as any },
            });
            if (user) approverId = user.id;
          }

          if (approverId) {
            await tx.expenseApproval.create({
              data: {
                expense_id: expense.id,
                approver_id: approverId,
                step_order: flow.step_order,
                status: 'PENDING',
              },
            });
          }
        }
      }
    });

    return expense;
  }

  async getMyExpenses(employeeId: number) {
    return this.prisma.expense.findMany({
      where: { employee_id: employeeId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            currency_code: true,
            currency_symbol: true,
          },
        },
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        attachments: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}