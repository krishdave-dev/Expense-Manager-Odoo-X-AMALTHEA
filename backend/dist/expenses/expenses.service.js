"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const exchange_rates_service_1 = require("../exchange-rates/exchange-rates.service");
let ExpensesService = class ExpensesService {
    constructor(prisma, exchangeRatesService) {
        this.prisma = prisma;
        this.exchangeRatesService = exchangeRatesService;
    }
    async createExpense(employeeId, dto) {
        const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
        const company = await this.prisma.company.findUnique({ where: { id: employee.company_id } });
        let convertedAmount = dto.amount;
        if (dto.currency_code !== company.currency_code) {
            convertedAmount = await this.exchangeRatesService.convertAmount(dto.amount, dto.currency_code, company.currency_code);
        }
        const expense = await this.prisma.expense.create({
            data: {
                ...dto,
                employee_id: employeeId,
                company_id: company.id,
                converted_amount: convertedAmount,
                date: new Date(dto.date),
            },
        });
        await this.prisma.$transaction(async (tx) => {
            const flows = await tx.approvalFlow.findMany({
                where: { company_id: company.id },
                orderBy: { step_order: 'asc' },
            });
            for (const flow of flows) {
                let approverId = null;
                if (flow.is_manager_approver) {
                    const manager = await tx.user.findFirst({
                        where: { company_id: company.id, role: 'MANAGER' },
                    });
                    if (manager)
                        approverId = manager.id;
                }
                else if (flow.specific_user_id) {
                    approverId = flow.specific_user_id;
                }
                else {
                    const user = await tx.user.findFirst({
                        where: { company_id: company.id, role: flow.approver_role },
                    });
                    if (user)
                        approverId = user.id;
                }
                if (approverId) {
                    await tx.expenseApproval.create({
                        data: {
                            expense_id: expense.id,
                            approver_id: approverId,
                            step_order: flow.step_order,
                            status: 'PENDING',
                        },
                    });
                }
            }
        });
        return expense;
    }
    async getMyExpenses(employeeId) {
        return this.prisma.expense.findMany({
            where: { employee_id: employeeId },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                        currency_code: true,
                        currency_symbol: true,
                    },
                },
                approvals: {
                    include: {
                        approver: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
                attachments: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        exchange_rates_service_1.ExchangeRatesService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map