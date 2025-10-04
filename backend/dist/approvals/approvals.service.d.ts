import { PrismaService } from '../prisma/prisma.service';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
export declare class ApprovalsService {
    private prisma;
    constructor(prisma: PrismaService);
    approveExpense(expenseId: number, approverId: number, dto: ApproveExpenseDto): Promise<{
        success: boolean;
        newStatus: string;
    }>;
    getPendingApprovals(approverId: number): Promise<{
        id: number;
        expenseId: number;
        approverId: number;
        stepOrder: number;
        status: import(".prisma/client").$Enums.ApprovalStatus;
        comments: string;
        approvedAt: string;
        createdAt: string;
        updatedAt: string;
        expense: {
            id: number;
            employeeId: number;
            companyId: number;
            category: string;
            description: string;
            amount: string;
            currencyCode: string;
            convertedAmount: string;
            date: string;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            createdAt: string;
            updatedAt: string;
            employee: {
                id: number;
                created_at: Date;
                updated_at: Date;
                name: string;
                company_id: number;
                email: string;
                password_hash: string;
                role: import(".prisma/client").$Enums.Role;
                is_active: boolean;
                is_temp_password: boolean;
            };
            company: {
                id: number;
                name: string;
                currencyCode: string;
                currencySymbol: string;
            };
        };
    }[]>;
    setupDefaultApprovalFlow(companyId: number): Promise<{
        message: string;
        flow: {
            id: number;
            step_order: number;
            created_at: Date;
            company_id: number;
            approver_role: import(".prisma/client").$Enums.ApproverRole;
            specific_user_id: number | null;
            is_manager_approver: boolean;
        };
    }>;
    getAllApprovalsDebug(): Promise<{
        total: number;
        approvals: ({
            expense: {
                employee: {
                    id: number;
                    created_at: Date;
                    updated_at: Date;
                    name: string;
                    company_id: number;
                    email: string;
                    password_hash: string;
                    role: import(".prisma/client").$Enums.Role;
                    is_active: boolean;
                    is_temp_password: boolean;
                };
                company: {
                    id: number;
                    created_at: Date;
                    updated_at: Date;
                    name: string;
                    currency_code: string;
                    country: string | null;
                    currency_symbol: string | null;
                };
            } & {
                id: number;
                status: import(".prisma/client").$Enums.ExpenseStatus;
                created_at: Date;
                updated_at: Date;
                employee_id: number;
                company_id: number;
                category: string | null;
                description: string | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency_code: string;
                converted_amount: import("@prisma/client/runtime/library").Decimal | null;
                date: Date;
            };
            approver: {
                id: number;
                created_at: Date;
                updated_at: Date;
                name: string;
                company_id: number;
                email: string;
                password_hash: string;
                role: import(".prisma/client").$Enums.Role;
                is_active: boolean;
                is_temp_password: boolean;
            };
        } & {
            id: number;
            expense_id: number;
            approver_id: number;
            step_order: number | null;
            status: import(".prisma/client").$Enums.ApprovalStatus;
            comments: string | null;
            approved_at: Date | null;
            created_at: Date;
            updated_at: Date;
        })[];
    }>;
    getApprovalFlows(adminUserId: number): Promise<{
        id: number;
        companyId: number;
        stepOrder: number;
        approverRole: import(".prisma/client").$Enums.ApproverRole;
        specificUserId: number;
        isManagerApprover: boolean;
        createdAt: string;
        specificUser: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }[]>;
    createApprovalFlow(adminUserId: number, flowData: any): Promise<{
        message: string;
        flow: {
            id: number;
            companyId: number;
            stepOrder: number;
            approverRole: import(".prisma/client").$Enums.ApproverRole;
            specificUserId: number;
            isManagerApprover: boolean;
            createdAt: string;
            specificUser: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    updateApprovalFlow(flowId: number, adminUserId: number, flowData: any): Promise<{
        message: string;
        flow: {
            id: number;
            companyId: number;
            stepOrder: number;
            approverRole: import(".prisma/client").$Enums.ApproverRole;
            specificUserId: number;
            isManagerApprover: boolean;
            createdAt: string;
            specificUser: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    deleteApprovalFlow(flowId: number, adminUserId: number): Promise<{
        message: string;
    }>;
    getApprovalRules(adminUserId: number): Promise<{
        id: number;
        companyId: number;
        ruleType: import(".prisma/client").$Enums.RuleType;
        percentageThreshold: number;
        specificApproverId: number;
        hybridCondition: import("@prisma/client/runtime/library").JsonValue;
        createdAt: string;
        specificApprover: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }[]>;
    createApprovalRule(adminUserId: number, ruleData: any): Promise<{
        message: string;
        rule: {
            id: number;
            companyId: number;
            ruleType: import(".prisma/client").$Enums.RuleType;
            percentageThreshold: number;
            specificApproverId: number;
            hybridCondition: import("@prisma/client/runtime/library").JsonValue;
            createdAt: string;
            specificApprover: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    updateApprovalRule(ruleId: number, adminUserId: number, ruleData: any): Promise<{
        message: string;
        rule: {
            id: number;
            companyId: number;
            ruleType: import(".prisma/client").$Enums.RuleType;
            percentageThreshold: number;
            specificApproverId: number;
            hybridCondition: import("@prisma/client/runtime/library").JsonValue;
            createdAt: string;
            specificApprover: {
                id: number;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    deleteApprovalRule(ruleId: number, adminUserId: number): Promise<{
        message: string;
    }>;
}
