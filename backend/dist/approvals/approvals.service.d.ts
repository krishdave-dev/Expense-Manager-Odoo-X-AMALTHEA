import { PrismaService } from '../prisma/prisma.service';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
export declare class ApprovalsService {
    private prisma;
    constructor(prisma: PrismaService);
    approveExpense(expenseId: number, approverId: number, dto: ApproveExpenseDto): Promise<{
        success: boolean;
        newStatus: string;
    }>;
    getPendingApprovals(approverId: number): Promise<({
        expense: {
            company: {
                name: string;
                country: string | null;
                currency_code: string;
                currency_symbol: string | null;
                created_at: Date;
                updated_at: Date;
                id: number;
            };
            employee: {
                name: string;
                email: string;
                created_at: Date;
                updated_at: Date;
                id: number;
                password_hash: string;
                role: import(".prisma/client").$Enums.Role;
                is_active: boolean;
                company_id: number;
                is_temp_password: boolean;
            };
        } & {
            currency_code: string;
            created_at: Date;
            updated_at: Date;
            id: number;
            company_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            category: string | null;
            description: string | null;
            date: Date;
            converted_amount: import("@prisma/client/runtime/library").Decimal | null;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            employee_id: number;
        };
    } & {
        created_at: Date;
        updated_at: Date;
        id: number;
        step_order: number | null;
        status: import(".prisma/client").$Enums.ApprovalStatus;
        expense_id: number;
        approver_id: number;
        comments: string | null;
        approved_at: Date | null;
    })[]>;
    setupDefaultApprovalFlow(companyId: number): Promise<{
        message: string;
        flow: {
            created_at: Date;
            id: number;
            company_id: number;
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
                    currency_code: string;
                    currency_symbol: string | null;
                    created_at: Date;
                    updated_at: Date;
                    id: number;
                };
                employee: {
                    email: string;
                    name: string;
                    created_at: Date;
                    updated_at: Date;
                    id: number;
                    password_hash: string;
                    role: import(".prisma/client").$Enums.Role;
                    is_active: boolean;
                    company_id: number;
                };
            } & {
                currency_code: string;
                created_at: Date;
                updated_at: Date;
                id: number;
                company_id: number;
                amount: import("@prisma/client/runtime/library").Decimal;
                category: string | null;
                description: string | null;
                date: Date;
                converted_amount: import("@prisma/client/runtime/library").Decimal | null;
                status: import(".prisma/client").$Enums.ExpenseStatus;
                employee_id: number;
            };
            approver: {
                email: string;
                name: string;
                created_at: Date;
                updated_at: Date;
                id: number;
                password_hash: string;
                role: import(".prisma/client").$Enums.Role;
                is_active: boolean;
                company_id: number;
            };
        } & {
            created_at: Date;
            updated_at: Date;
            id: number;
            step_order: number | null;
            status: import(".prisma/client").$Enums.ApprovalStatus;
            comments: string | null;
            approved_at: Date | null;
            expense_id: number;
            approver_id: number;
        })[];
    }>;
}
