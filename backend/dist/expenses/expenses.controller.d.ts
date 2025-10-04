import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
export declare class ExpensesController {
    private expensesService;
    constructor(expensesService: ExpensesService);
    create(dto: CreateExpenseDto, req: any): Promise<{
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
    }>;
    getMy(req: any): Promise<{
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
        };
        company: {
            id: number;
            name: string;
            currencyCode: string;
            currencySymbol: string;
        };
        approvals: {
            id: number;
            expenseId: number;
            approverId: number;
            stepOrder: number;
            status: import(".prisma/client").$Enums.ApprovalStatus;
            comments: string;
            approvedAt: string;
            createdAt: string;
            updatedAt: string;
            approver: {
                email: string;
                name: string;
                id: number;
                role: import(".prisma/client").$Enums.Role;
            };
        }[];
        attachments: {
            id: number;
            expenseId: number;
            fileUrl: string;
            ocrData: import("@prisma/client/runtime/library").JsonValue;
            createdAt: string;
        }[];
    }[]>;
}
