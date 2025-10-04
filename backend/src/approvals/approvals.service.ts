// src/approvals/approvals.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApproveExpenseDto } from './dto/approve-expense.dto';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async approveExpense(expenseId: number, approverId: number, dto: ApproveExpenseDto) {
    await this.prisma.expenseApproval.update({
      where: { expense_id_approver_id: { expense_id: expenseId, approver_id: approverId } },
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
    return this.prisma.expenseApproval.findMany({
      where: { approver_id: approverId, status: 'PENDING' },
      include: { expense: { include: { employee: true, company: true } } },
    });
  }
}