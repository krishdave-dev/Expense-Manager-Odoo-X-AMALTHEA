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
    return approvals;
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