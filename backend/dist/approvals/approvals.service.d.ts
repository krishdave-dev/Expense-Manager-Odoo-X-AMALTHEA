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
                email: string;
                name: string;
                id: number;
                company_id: number;
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
    setupDefaultApprovalFlow(companyId: number): Promise<{
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
    getAllApprovalsDebug(): Promise<{
        total: number;
        approvals: ({
            expense: {
                company: {
                    name: string;
                    country: string | null;
                    id: number;
                    created_at: Date;
                    updated_at: Date;
                    currency_code: string;
                    currency_symbol: string | null;
                };
                employee: {
                    email: string;
                    name: string;
                    id: number;
                    company_id: number;
                    password_hash: string;
                    role: import(".prisma/client").$Enums.Role;
                    is_active: boolean;
                    is_temp_password: boolean;
                    created_at: Date;
                    updated_at: Date;
                };
            } & {
                date: Date;
                id: number;
                company_id: number;
                created_at: Date;
                updated_at: Date;
                currency_code: string;
                employee_id: number;
                amount: import("@prisma/client/runtime/library").Decimal;
                category: string | null;
                description: string | null;
                converted_amount: import("@prisma/client/runtime/library").Decimal | null;
                status: import(".prisma/client").$Enums.ExpenseStatus;
            };
            approver: {
                email: string;
                name: string;
                id: number;
                company_id: number;
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
            expense_id: number;
            approver_id: number;
            comments: string | null;
            approved_at: Date | null;
        })[];
    }>;
}
