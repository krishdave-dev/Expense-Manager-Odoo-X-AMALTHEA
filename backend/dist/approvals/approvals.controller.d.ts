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
    setupApprovalFlow(companyId: string): Promise<{
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
    getAllApprovals(): Promise<{
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
                name: string;
                email: string;
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
                name: string;
                email: string;
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
                name: string;
                email: string;
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
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    deleteApprovalRule(ruleId: number, user: any): Promise<{
        message: string;
    }>;
}
