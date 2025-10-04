import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
export declare class ExpensesController {
    private expensesService;
    constructor(expensesService: ExpensesService);
    create(dto: CreateExpenseDto, user: any): Promise<{
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
    getMy(user: any): Promise<{
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
    getAllCompanyExpenses(user: any): Promise<{
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
    getExpenseById(expenseId: number, user: any): Promise<{
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
    overrideApproval(expenseId: number, status: 'APPROVED' | 'REJECTED', comments: string, user: any): Promise<{
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
}
