// src/approvals/approvals.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveExpenseDto } from './dto/approve-expense.dto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async approveExpense(expenseId: number, approverId: number, dto: ApproveExpenseDto) {
    // First, find the approval record to make sure it exists
    const approval = await this.prisma.expenseApproval.findFirst({
      where: { 
        expense_id: expenseId,
        approver_id: approverId,
        status: 'PENDING'
      },
    });

    if (!approval) {
      throw new Error('No pending approval found for this expense and approver');
    }

    // Update the approval record using the ID
    await this.prisma.expenseApproval.update({
      where: { id: approval.id },
      data: {
        status: dto.status,
        comments: dto.comments,
        approved_at: dto.status === 'APPROVED' ? new Date() : null,
      },
    });

    const approvals = await this.prisma.expenseApproval.findMany({
      where: { expense_id: expenseId },
    });

    const anyRejected = approvals.some(a => a.status === 'REJECTED');
    const allApproved = approvals.every(a => a.status === 'APPROVED');

    let finalStatus = 'PENDING';
    if (anyRejected) finalStatus = 'REJECTED';
    else if (allApproved) finalStatus = 'APPROVED';

    await this.prisma.expense.update({
      where: { id: expenseId },
      data: { status: finalStatus as any },
    });

    return { success: true, newStatus: finalStatus };
  }

  async getPendingApprovals(approverId: number) {
    console.log(`Looking for pending approvals for approver ID: ${approverId}`);
    
    const approvals = await this.prisma.expenseApproval.findMany({
      where: { approver_id: approverId, status: 'PENDING' },
      include: { expense: { include: { employee: true, company: true } } },
    });

    console.log(`Found ${approvals.length} pending approvals`);
    
    // Transform to camelCase
    return approvals.map(approval => ({
      id: approval.id,
      expenseId: approval.expense_id,
      approverId: approval.approver_id,
      stepOrder: approval.step_order,
      status: approval.status,
      comments: approval.comments,
      approvedAt: approval.approved_at?.toISOString(),
      createdAt: approval.created_at.toISOString(),
      updatedAt: approval.updated_at.toISOString(),
      expense: {
        id: approval.expense.id,
        employeeId: approval.expense.employee_id,
        companyId: approval.expense.company_id,
        category: approval.expense.category,
        description: approval.expense.description,
        amount: approval.expense.amount.toString(),
        currencyCode: approval.expense.currency_code,
        convertedAmount: approval.expense.converted_amount?.toString(),
        date: approval.expense.date.toISOString(),
        status: approval.expense.status,
        createdAt: approval.expense.created_at.toISOString(),
        updatedAt: approval.expense.updated_at.toISOString(),
        employee: approval.expense.employee,
        company: {
          id: approval.expense.company.id,
          name: approval.expense.company.name,
          currencyCode: approval.expense.company.currency_code,
          currencySymbol: approval.expense.company.currency_symbol,
        },
      },
    }));
  }

  async setupDefaultApprovalFlow(companyId: number) {
    // Check if approval flow already exists
    const existingFlow = await this.prisma.approvalFlow.findFirst({
      where: { company_id: companyId },
    });

    if (existingFlow) {
      return { message: 'Approval flow already exists', flow: existingFlow };
    }

    // Find the admin user for this company
    const adminUser = await this.prisma.user.findFirst({
      where: { company_id: companyId, role: 'ADMIN' },
    });

    if (!adminUser) {
      throw new Error('No admin user found for this company');
    }

    // Create default approval flow
    const flow = await this.prisma.approvalFlow.create({
      data: {
        company_id: companyId,
        step_order: 1,
        approver_role: 'ADMIN',
        specific_user_id: adminUser.id,
        is_manager_approver: false,
      },
    });

    return { message: 'Default approval flow created', flow };
  }

  async getAllApprovalsDebug() {
    const approvals = await this.prisma.expenseApproval.findMany({
      include: { 
        expense: { 
          include: { employee: true, company: true } 
        },
        approver: true
      },
    });
    
    console.log('All approvals in database:', approvals);
    return { total: approvals.length, approvals };
  }
}