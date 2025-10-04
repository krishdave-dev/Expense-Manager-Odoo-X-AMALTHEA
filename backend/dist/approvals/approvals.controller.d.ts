import { ApprovalsService } from './approvals.service';
import { ApproveExpenseDto } from './dto/approve-expense.dto';
export declare class ApprovalsController {
    private approvalsService;
    constructor(approvalsService: ApprovalsService);
    approve(expenseId: string, dto: ApproveExpenseDto, req: any): Promise<{
        success: boolean;
        newStatus: string;
    }>;
    getPending(req: any): Promise<({
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
            amount: import("@prisma/client/runtime/library").Decimal;
            category: string | null;
            description: string | null;
            converted_amount: import("@prisma/client/runtime/library").Decimal | null;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            employee_id: number;
        };
    } & {
        id: number;
        created_at: Date;
        updated_at: Date;
        status: import(".prisma/client").$Enums.ApprovalStatus;
        step_order: number | null;
        comments: string | null;
        approved_at: Date | null;
        expense_id: number;
        approver_id: number;
    })[]>;
}
