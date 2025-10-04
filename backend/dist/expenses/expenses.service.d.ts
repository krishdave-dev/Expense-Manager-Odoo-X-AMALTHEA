import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
export declare class ExpensesService {
    private prisma;
    private exchangeRatesService;
    constructor(prisma: PrismaService, exchangeRatesService: ExchangeRatesService);
    createExpense(employeeId: number, dto: CreateExpenseDto): Promise<{
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
    getMyExpenses(employeeId: number): Promise<({
        company: {
            name: string;
            currency_code: string;
            currency_symbol: string;
            id: number;
        };
        approvals: ({
            approver: {
                name: string;
                id: number;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            created_at: Date;
            updated_at: Date;
            id: number;
            step_order: number | null;
            status: import(".prisma/client").$Enums.ApprovalStatus;
            expense_id: number;
            approver_id: number | null;
            comments: string | null;
            approved_at: Date | null;
        })[];
        employee: {
            name: string;
            id: number;
            email: string;
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
