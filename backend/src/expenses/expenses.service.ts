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
    const expenses = await this.prisma.expense.findMany({
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

    // Transform to camelCase
    return expenses.map(expense => ({
      id: expense.id,
      employeeId: expense.employee_id,
      companyId: expense.company_id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      currencyCode: expense.currency_code,
      convertedAmount: expense.converted_amount?.toString(),
      date: expense.date.toISOString(),
      status: expense.status,
      createdAt: expense.created_at.toISOString(),
      updatedAt: expense.updated_at.toISOString(),
      employee: expense.employee,
      company: {
        id: expense.company.id,
        name: expense.company.name,
        currencyCode: expense.company.currency_code,
        currencySymbol: expense.company.currency_symbol,
      },
      approvals: expense.approvals.map(approval => ({
        id: approval.id,
        expenseId: approval.expense_id,
        approverId: approval.approver_id,
        stepOrder: approval.step_order,
        status: approval.status,
        comments: approval.comments,
        approvedAt: approval.approved_at?.toISOString(),
        createdAt: approval.created_at.toISOString(),
        updatedAt: approval.updated_at.toISOString(),
        approver: approval.approver,
      })),
      attachments: expense.attachments.map(attachment => ({
        id: attachment.id,
        expenseId: attachment.expense_id,
        fileUrl: attachment.file_url,
        ocrData: attachment.ocr_data,
        createdAt: attachment.created_at.toISOString(),
      })),
    }));
  }
}