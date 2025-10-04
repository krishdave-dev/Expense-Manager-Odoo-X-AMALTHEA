"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ApprovalsService = class ApprovalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async approveExpense(expenseId, approverId, dto) {
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
        if (anyRejected)
            finalStatus = 'REJECTED';
        else if (allApproved)
            finalStatus = 'APPROVED';
        await this.prisma.expense.update({
            where: { id: expenseId },
            data: { status: finalStatus },
        });
        return { success: true, newStatus: finalStatus };
    }
    async getPendingApprovals(approverId) {
        return this.prisma.expenseApproval.findMany({
            where: { approver_id: approverId, status: 'PENDING' },
            include: { expense: { include: { employee: true, company: true } } },
        });
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map