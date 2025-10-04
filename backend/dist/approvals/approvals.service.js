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
        console.log(`Looking for pending approvals for approver ID: ${approverId}`);
        const approvals = await this.prisma.expenseApproval.findMany({
            where: { approver_id: approverId, status: 'PENDING' },
            include: { expense: { include: { employee: true, company: true } } },
        });
        console.log(`Found ${approvals.length} pending approvals`);
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
    async setupDefaultApprovalFlow(companyId) {
        const existingFlow = await this.prisma.approvalFlow.findFirst({
            where: { company_id: companyId },
        });
        if (existingFlow) {
            return { message: 'Approval flow already exists', flow: existingFlow };
        }
        const adminUser = await this.prisma.user.findFirst({
            where: { company_id: companyId, role: 'ADMIN' },
        });
        if (!adminUser) {
            throw new Error('No admin user found for this company');
        }
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
    async getApprovalFlows(adminUserId) {
        const adminUser = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can view approval flows');
        }
        const flows = await this.prisma.approvalFlow.findMany({
            where: { company_id: adminUser.company_id },
            include: {
                specificUser: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
            orderBy: { step_order: 'asc' },
        });
        return flows.map(flow => ({
            id: flow.id,
            companyId: flow.company_id,
            stepOrder: flow.step_order,
            approverRole: flow.approver_role,
            specificUserId: flow.specific_user_id,
            isManagerApprover: flow.is_manager_approver,
            createdAt: flow.created_at.toISOString(),
            specificUser: flow.specificUser ? {
                id: flow.specificUser.id,
                name: flow.specificUser.name,
                email: flow.specificUser.email,
                role: flow.specificUser.role,
            } : null,
        }));
    }
    async createApprovalFlow(adminUserId, flowData) {
        const adminUser = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can create approval flows');
        }
        const flow = await this.prisma.approvalFlow.create({
            data: {
                company_id: adminUser.company_id,
                step_order: flowData.stepOrder,
                approver_role: flowData.approverRole,
                specific_user_id: flowData.specificUserId || null,
                is_manager_approver: flowData.isManagerApprover || false,
            },
            include: {
                specificUser: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        return {
            message: 'Approval flow created successfully',
            flow: {
                id: flow.id,
                companyId: flow.company_id,
                stepOrder: flow.step_order,
                approverRole: flow.approver_role,
                specificUserId: flow.specific_user_id,
                isManagerApprover: flow.is_manager_approver,
                createdAt: flow.created_at.toISOString(),
                specificUser: flow.specificUser,
            },
        };
    }
    async updateApprovalFlow(flowId, adminUserId, flowData) {
        const adminUser = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can update approval flows');
        }
        const existingFlow = await this.prisma.approvalFlow.findUnique({
            where: { id: flowId },
        });
        if (!existingFlow || existingFlow.company_id !== adminUser.company_id) {
            throw new Error('Approval flow not found or access denied');
        }
        const flow = await this.prisma.approvalFlow.update({
            where: { id: flowId },
            data: {
                step_order: flowData.stepOrder,
                approver_role: flowData.approverRole,
                specific_user_id: flowData.specificUserId || null,
                is_manager_approver: flowData.isManagerApprover || false,
            },
            include: {
                specificUser: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        return {
            message: 'Approval flow updated successfully',
            flow: {
                id: flow.id,
                companyId: flow.company_id,
                stepOrder: flow.step_order,
                approverRole: flow.approver_role,
                specificUserId: flow.specific_user_id,
                isManagerApprover: flow.is_manager_approver,
                createdAt: flow.created_at.toISOString(),
                specificUser: flow.specificUser,
            },
        };
    }
    async deleteApprovalFlow(flowId, adminUserId) {
        const adminUser = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can delete approval flows');
        }
        const flow = await this.prisma.approvalFlow.findUnique({
            where: { id: flowId },
        });
        if (!flow || flow.company_id !== adminUser.company_id) {
            throw new Error('Approval flow not found or access denied');
        }
        await this.prisma.approvalFlow.delete({
            where: { id: flowId },
        });
        return { message: 'Approval flow deleted successfully' };
    }
    async getApprovalRules(adminUserId) {
        const adminUser = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can view approval rules');
        }
        const rules = await this.prisma.approvalRule.findMany({
            where: { company_id: adminUser.company_id },
            include: {
                specificApprover: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        return rules.map(rule => ({
            id: rule.id,
            companyId: rule.company_id,
            ruleType: rule.rule_type,
            percentageThreshold: rule.percentage_threshold,
            specificApproverId: rule.specific_approver_id,
            hybridCondition: rule.hybrid_condition,
            createdAt: rule.created_at.toISOString(),
            specificApprover: rule.specificApprover ? {
                id: rule.specificApprover.id,
                name: rule.specificApprover.name,
                email: rule.specificApprover.email,
                role: rule.specificApprover.role,
            } : null,
        }));
    }
    async createApprovalRule(adminUserId, ruleData) {
        const adminUser = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can create approval rules');
        }
        const rule = await this.prisma.approvalRule.create({
            data: {
                company_id: adminUser.company_id,
                rule_type: ruleData.ruleType,
                percentage_threshold: ruleData.percentageThreshold || null,
                specific_approver_id: ruleData.specificApproverId || null,
                hybrid_condition: ruleData.hybridCondition || null,
            },
            include: {
                specificApprover: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        return {
            message: 'Approval rule created successfully',
            rule: {
                id: rule.id,
                companyId: rule.company_id,
                ruleType: rule.rule_type,
                percentageThreshold: rule.percentage_threshold,
                specificApproverId: rule.specific_approver_id,
                hybridCondition: rule.hybrid_condition,
                createdAt: rule.created_at.toISOString(),
                specificApprover: rule.specificApprover,
            },
        };
    }
    async updateApprovalRule(ruleId, adminUserId, ruleData) {
        const adminUser = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can update approval rules');
        }
        const existingRule = await this.prisma.approvalRule.findUnique({
            where: { id: ruleId },
        });
        if (!existingRule || existingRule.company_id !== adminUser.company_id) {
            throw new Error('Approval rule not found or access denied');
        }
        const rule = await this.prisma.approvalRule.update({
            where: { id: ruleId },
            data: {
                rule_type: ruleData.ruleType,
                percentage_threshold: ruleData.percentageThreshold || null,
                specific_approver_id: ruleData.specificApproverId || null,
                hybrid_condition: ruleData.hybridCondition || null,
            },
            include: {
                specificApprover: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        return {
            message: 'Approval rule updated successfully',
            rule: {
                id: rule.id,
                companyId: rule.company_id,
                ruleType: rule.rule_type,
                percentageThreshold: rule.percentage_threshold,
                specificApproverId: rule.specific_approver_id,
                hybridCondition: rule.hybrid_condition,
                createdAt: rule.created_at.toISOString(),
                specificApprover: rule.specificApprover,
            },
        };
    }
    async deleteApprovalRule(ruleId, adminUserId) {
        const adminUser = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can delete approval rules');
        }
        const rule = await this.prisma.approvalRule.findUnique({
            where: { id: ruleId },
        });
        if (!rule || rule.company_id !== adminUser.company_id) {
            throw new Error('Approval rule not found or access denied');
        }
        await this.prisma.approvalRule.delete({
            where: { id: ruleId },
        });
        return { message: 'Approval rule deleted successfully' };
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map