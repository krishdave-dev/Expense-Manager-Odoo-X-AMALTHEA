import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
export declare class ExpensesService {
    private prisma;
    private exchangeRatesService;
    constructor(prisma: PrismaService, exchangeRatesService: ExchangeRatesService);
    createExpense(employeeId: number, dto: CreateExpenseDto): Promise<{
        category: string | null;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency_code: string;
        converted_amount: import("@prisma/client/runtime/library").Decimal | null;
        date: Date;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        created_at: Date;
        updated_at: Date;
        id: number;
        employee_id: number;
        company_id: number;
    }>;
    getMyExpenses(employeeId: number): Promise<{
        id: any;
        employeeId: any;
        companyId: any;
        category: any;
        description: any;
        amount: any;
        currencyCode: any;
        convertedAmount: any;
        date: any;
        status: any;
        createdAt: any;
        updatedAt: any;
        employee: any;
        company: {
            id: any;
            name: any;
            currencyCode: any;
            currencySymbol: any;
        };
        approvals: any;
        attachments: any;
    }[]>;
    getAllCompanyExpenses(adminUserId: number): Promise<{
        expenses: {
            id: any;
            employeeId: any;
            companyId: any;
            category: any;
            description: any;
            amount: any;
            currencyCode: any;
            convertedAmount: any;
            date: any;
            status: any;
            createdAt: any;
            updatedAt: any;
            employee: any;
            company: {
                id: any;
                name: any;
                currencyCode: any;
                currencySymbol: any;
            };
            approvals: any;
            attachments: any;
        }[];
        total: number;
    }>;
    getExpenseById(expenseId: number, userId: number, userRole: string): Promise<{
        id: any;
        employeeId: any;
        companyId: any;
        category: any;
        description: any;
        amount: any;
        currencyCode: any;
        convertedAmount: any;
        date: any;
        status: any;
        createdAt: any;
        updatedAt: any;
        employee: any;
        company: {
            id: any;
            name: any;
            currencyCode: any;
            currencySymbol: any;
        };
        approvals: any;
        attachments: any;
    }>;
    overrideApproval(expenseId: number, adminUserId: number, status: 'APPROVED' | 'REJECTED', comments?: string): Promise<{
        message: string;
        expense: {
            category: string | null;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency_code: string;
            converted_amount: import("@prisma/client/runtime/library").Decimal | null;
            date: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            created_at: Date;
            updated_at: Date;
            id: number;
            employee_id: number;
            company_id: number;
        };
    }>;
    private transformExpenses;
}
