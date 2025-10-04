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
    createDraft(dto: CreateExpenseDto, user: any): Promise<{
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
    getMyDrafts(user: any): Promise<{
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
    getMyDraftsTotal(user: any): Promise<import("@prisma/client/runtime/library").Decimal | 0>;
    submitDraft(expenseId: number, user: any): Promise<{
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
    updateDraft(expenseId: number, dto: CreateExpenseDto, user: any): Promise<{
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
    getTeamExpenses(user: any): Promise<{
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
        debug: {
            managerId: number;
            userRole: string;
            whereClause: any;
            rawExpenseCount: number;
        };
    }>;
    getManagerDebugInfo(user: any): Promise<{
        manager: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: number;
            company: {
                currency_code: string;
                created_at: Date;
                updated_at: Date;
                id: number;
                name: string;
                country: string | null;
                currency_symbol: string | null;
            };
        };
        managerRelations: {
            employeeId: number;
            employee: {
                id: number;
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
            };
        }[];
        allCompanyEmployees: {
            id: number;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
        recentExpenses: {
            id: number;
            employeeId: number;
            employeeName: string;
            amount: string;
            description: string;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            date: Date;
        }[];
        stats: {
            totalManagerRelations: number;
            totalCompanyEmployees: number;
            totalCompanyExpenses: number;
        };
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
    processReceipt(file: any, user: any): Promise<{
        success: boolean;
        data: {
            amount: number;
            date: string;
            description: string;
            vendor: string;
            category: string;
            confidence: number;
            rawText: any;
            processingTime: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
        message?: undefined;
    }>;
}
