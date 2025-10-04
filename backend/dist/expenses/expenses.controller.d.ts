import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
export declare class ExpensesController {
    private expensesService;
    constructor(expensesService: ExpensesService);
    create(dto: CreateExpenseDto, req: any): Promise<{
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
    }>;
    getMy(req: any): Promise<({
        company: {
            name: string;
            currency_code: string;
            currency_symbol: string;
            id: number;
        };
        approvals: ({
            approver: {
                email: string;
                name: string;
                id: number;
                role: import(".prisma/client").$Enums.Role;
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
        employee: {
            email: string;
            name: string;
            id: number;
        };
        attachments: {
            created_at: Date;
            id: number;
            expense_id: number;
            file_url: string | null;
            ocr_data: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
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
    })[]>;
}
