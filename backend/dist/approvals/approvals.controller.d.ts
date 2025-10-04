import { ApprovalsService } from './approvals.service';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
import { CreateApprovalFlowDto, UpdateApprovalFlowDto } from './dto/approval-flow.dto';
import { CreateApprovalRuleDto, UpdateApprovalRuleDto } from './dto/approval-rule.dto';
export declare class ApprovalsController {
    private approvalsService;
    constructor(approvalsService: ApprovalsService);
    approve(expenseId: string, dto: ApproveExpenseDto, user: any): Promise<{
        success: boolean;
        newStatus: string;
    }>;
    getPending(user: any): Promise<{
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
                email: string;
                company_id: number;
                name: string;
                password_hash: string;
                role: import(".prisma/client").$Enums.Role;
                is_active: boolean;
                is_temp_password: boolean;
                created_at: Date;
                updated_at: Date;
            };
            company: {
                id: number;
                name: string;
                currencyCode: string;
                currencySymbol: string;
            };
        };
    }[]>;
    setupApprovalFlow(companyId: string): Promise<{
        message: string;
        flow: {
            id: number;
            company_id: number;
            created_at: Date;
            step_order: number;
            approver_role: import(".prisma/client").$Enums.ApproverRole;
            is_manager_approver: boolean;
            specific_user_id: number | null;
        };
    }>;
    getAllApprovals(): Promise<{
        total: number;
        approvals: ({
            expense: {
                company: {
                    id: number;
                    name: string;
                    created_at: Date;
                    updated_at: Date;
                    country: string | null;
                    currency_code: string;
                    currency_symbol: string | null;
                };
                employee: {
                    id: number;
                    email: string;
                    company_id: number;
                    name: string;
                    password_hash: string;
                    role: import(".prisma/client").$Enums.Role;
                    is_active: boolean;
                    is_temp_password: boolean;
                    created_at: Date;
                    updated_at: Date;
                };
            } & {
                id: number;
                company_id: number;
                created_at: Date;
                updated_at: Date;
                currency_code: string;
                employee_id: number;
                category: string | null;
                description: string | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                converted_amount: import("@prisma/client/runtime/library").Decimal | null;
                date: Date;
                status: import(".prisma/client").$Enums.ExpenseStatus;
            };
            approver: {
                id: number;
                email: string;
                company_id: number;
                name: string;
                password_hash: string;
                role: import(".prisma/client").$Enums.Role;
                is_active: boolean;
                is_temp_password: boolean;
                created_at: Date;
                updated_at: Date;
            };
        } & {
            id: number;
            created_at: Date;
            updated_at: Date;
            step_order: number | null;
            status: import(".prisma/client").$Enums.ApprovalStatus;
            comments: string | null;
            approved_at: Date | null;
            expense_id: number;
            approver_id: number;
        })[];
    }>;
    getApprovalFlows(user: any): Promise<{
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
    createApprovalFlow(user: any, flowData: CreateApprovalFlowDto): Promise<{
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
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    updateApprovalFlow(flowId: number, user: any, flowData: UpdateApprovalFlowDto): Promise<{
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
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    deleteApprovalFlow(flowId: number, user: any): Promise<{
        message: string;
    }>;
    getApprovalRules(user: any): Promise<{
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
    createApprovalRule(user: any, ruleData: CreateApprovalRuleDto): Promise<{
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
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    updateApprovalRule(ruleId: number, user: any, ruleData: UpdateApprovalRuleDto): Promise<{
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
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    deleteApprovalRule(ruleId: number, user: any): Promise<{
        message: string;
    }>;
}
