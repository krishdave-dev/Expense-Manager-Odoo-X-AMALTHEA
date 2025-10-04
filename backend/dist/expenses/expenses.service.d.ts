import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
export declare class ExpensesService {
    private prisma;
    private exchangeRatesService;
    constructor(prisma: PrismaService, exchangeRatesService: ExchangeRatesService);
    createExpense(employeeId: number, dto: CreateExpenseDto, isDraft?: boolean): Promise<{
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
    getDraftExpenses(employeeId: number): Promise<{
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
    getDraftExpensesTotal(employeeId: number): Promise<import("@prisma/client/runtime/library").Decimal | 0>;
    submitDraftExpense(expenseId: number, employeeId: number): Promise<{
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
    updateDraftExpense(expenseId: number, employeeId: number, dto: CreateExpenseDto): Promise<{
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
    getTeamExpenses(managerId: number, userRole: string): Promise<{
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
    getManagerDebugInfo(managerId: number): Promise<{
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
    processReceiptOCR(file: any, userId: number): Promise<{
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
    private parseReceiptText;
    private extractAmountFromText;
    private extractDateFromText;
    private extractVendorFromText;
    private extractDescriptionFromText;
    private categorizeFromText;
    private transformExpenses;
}
