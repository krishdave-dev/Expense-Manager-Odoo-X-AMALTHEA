import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
export declare class ExpensesService {
    private prisma;
    private exchangeRatesService;
    constructor(prisma: PrismaService, exchangeRatesService: ExchangeRatesService);
    createExpense(employeeId: number, dto: CreateExpenseDto): Promise<{
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
    }>;
    getMyExpenses(employeeId: number): Promise<({
        company: {
            name: string;
            id: number;
            currency_code: string;
            currency_symbol: string;
        };
        attachments: {
            id: number;
            created_at: Date;
            expense_id: number;
            file_url: string | null;
            ocr_data: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        approvals: ({
            approver: {
                email: string;
                name: string;
                id: number;
                role: import(".prisma/client").$Enums.Role;
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
        })[];
        employee: {
            email: string;
            name: string;
            id: number;
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
    })[]>;
}
