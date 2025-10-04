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
const tesseract_js_1 = require("tesseract.js");
let ExpensesService = class ExpensesService {
    constructor(prisma, exchangeRatesService) {
        this.prisma = prisma;
        this.exchangeRatesService = exchangeRatesService;
    }
    async createExpense(employeeId, dto, isDraft = false) {
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
                status: isDraft ? 'DRAFT' : 'PENDING',
            },
        });
        if (!isDraft) {
            await this.prisma.$transaction(async (tx) => {
                const flows = await tx.approvalFlow.findMany({
                    where: { company_id: company.id },
                    orderBy: { step_order: 'asc' },
                });
                if (flows.length === 0) {
                    const adminUser = await tx.user.findFirst({
                        where: { company_id: company.id, role: 'ADMIN' },
                    });
                    if (adminUser) {
                        await tx.expenseApproval.create({
                            data: {
                                expense_id: expense.id,
                                approver_id: adminUser.id,
                                step_order: 1,
                                status: 'PENDING',
                            },
                        });
                    }
                }
                else {
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
                }
            });
        }
        return expense;
    }
    async getMyExpenses(employeeId) {
        const expenses = await this.prisma.expense.findMany({
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
        return this.transformExpenses(expenses);
    }
    async getDraftExpenses(employeeId) {
        const expenses = await this.prisma.expense.findMany({
            where: {
                employee_id: employeeId,
                status: 'DRAFT'
            },
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
                attachments: true,
            },
            orderBy: { created_at: 'desc' },
        });
        return this.transformExpenses(expenses);
    }
    async getDraftExpensesTotal(employeeId) {
        const result = await this.prisma.expense.aggregate({
            where: {
                employee_id: employeeId,
                status: 'DRAFT'
            },
            _sum: {
                converted_amount: true,
            },
        });
        return result._sum.converted_amount || 0;
    }
    async submitDraftExpense(expenseId, employeeId) {
        const expense = await this.prisma.expense.findFirst({
            where: {
                id: expenseId,
                employee_id: employeeId,
                status: 'DRAFT'
            },
            include: {
                company: true
            }
        });
        if (!expense) {
            throw new Error('Draft expense not found');
        }
        const updatedExpense = await this.prisma.expense.update({
            where: { id: expenseId },
            data: { status: 'PENDING' },
        });
        await this.prisma.$transaction(async (tx) => {
            const flows = await tx.approvalFlow.findMany({
                where: { company_id: expense.company_id },
                orderBy: { step_order: 'asc' },
            });
            if (flows.length === 0) {
                const adminUser = await tx.user.findFirst({
                    where: { company_id: expense.company_id, role: 'ADMIN' },
                });
                if (adminUser) {
                    await tx.expenseApproval.create({
                        data: {
                            expense_id: expense.id,
                            approver_id: adminUser.id,
                            step_order: 1,
                            status: 'PENDING',
                        },
                    });
                }
            }
            else {
                for (const flow of flows) {
                    let approverId = null;
                    if (flow.is_manager_approver) {
                        const manager = await tx.user.findFirst({
                            where: { company_id: expense.company_id, role: 'MANAGER' },
                        });
                        if (manager)
                            approverId = manager.id;
                    }
                    else if (flow.specific_user_id) {
                        approverId = flow.specific_user_id;
                    }
                    else {
                        const user = await tx.user.findFirst({
                            where: { company_id: expense.company_id, role: flow.approver_role },
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
            }
        });
        return updatedExpense;
    }
    async updateDraftExpense(expenseId, employeeId, dto) {
        const expense = await this.prisma.expense.findFirst({
            where: {
                id: expenseId,
                employee_id: employeeId,
                status: 'DRAFT'
            },
            include: {
                company: true
            }
        });
        if (!expense) {
            throw new Error('Draft expense not found');
        }
        const company = await this.prisma.company.findUnique({
            where: { id: expense.company_id }
        });
        let convertedAmount = dto.amount;
        if (dto.currency_code !== company.currency_code) {
            convertedAmount = await this.exchangeRatesService.convertAmount(dto.amount, dto.currency_code, company.currency_code);
        }
        const updatedExpense = await this.prisma.expense.update({
            where: { id: expenseId },
            data: {
                ...dto,
                converted_amount: convertedAmount,
                date: new Date(dto.date),
            },
        });
        return updatedExpense;
    }
    async getAllCompanyExpenses(adminUserId) {
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminUserId },
        });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can view all company expenses');
        }
        const expenses = await this.prisma.expense.findMany({
            where: { company_id: adminUser.company_id },
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
        return {
            expenses: this.transformExpenses(expenses),
            total: expenses.length,
        };
    }
    async getTeamExpenses(managerId, userRole) {
        const manager = await this.prisma.user.findUnique({
            where: { id: managerId },
        });
        if (!manager) {
            throw new Error('Manager not found');
        }
        let whereClause = {};
        if (userRole === 'ADMIN') {
            whereClause = { company_id: manager.company_id };
        }
        else if (userRole === 'MANAGER') {
            const managerRelations = await this.prisma.managerRelation.findMany({
                where: { manager_id: managerId },
                select: { employee_id: true },
            });
            const employeeIds = managerRelations.map(rel => rel.employee_id);
            console.log(`Manager ${managerId} has ${employeeIds.length} assigned employees:`, employeeIds);
            if (employeeIds.length === 0) {
                console.log('No explicit manager relations found, showing all company expenses as fallback');
                whereClause = { company_id: manager.company_id };
            }
            else {
                whereClause = {
                    employee_id: { in: employeeIds },
                    company_id: manager.company_id,
                };
            }
        }
        else {
            throw new Error('Only managers and admins can view team expenses');
        }
        console.log('Where clause for team expenses:', JSON.stringify(whereClause, null, 2));
        const expenses = await this.prisma.expense.findMany({
            where: whereClause,
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
        console.log(`Found ${expenses.length} expenses for manager ${managerId} (${userRole})`);
        return {
            expenses: this.transformExpenses(expenses),
            total: expenses.length,
            debug: {
                managerId,
                userRole,
                whereClause,
                rawExpenseCount: expenses.length,
            },
        };
    }
    async getManagerDebugInfo(managerId) {
        const manager = await this.prisma.user.findUnique({
            where: { id: managerId },
            include: {
                company: true,
            },
        });
        if (!manager) {
            throw new Error('Manager not found');
        }
        const managerRelations = await this.prisma.managerRelation.findMany({
            where: { manager_id: managerId },
            include: {
                employee: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
        const allCompanyEmployees = await this.prisma.user.findMany({
            where: {
                company_id: manager.company_id,
                role: 'EMPLOYEE',
            },
            select: { id: true, name: true, email: true, role: true },
        });
        const allCompanyExpenses = await this.prisma.expense.findMany({
            where: { company_id: manager.company_id },
            include: {
                employee: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { created_at: 'desc' },
            take: 10,
        });
        return {
            manager: {
                id: manager.id,
                name: manager.name,
                email: manager.email,
                role: manager.role,
                companyId: manager.company_id,
                company: manager.company,
            },
            managerRelations: managerRelations.map(rel => ({
                employeeId: rel.employee_id,
                employee: rel.employee,
            })),
            allCompanyEmployees,
            recentExpenses: allCompanyExpenses.map(expense => ({
                id: expense.id,
                employeeId: expense.employee_id,
                employeeName: expense.employee.name,
                amount: expense.amount.toString(),
                description: expense.description,
                status: expense.status,
                date: expense.date,
            })),
            stats: {
                totalManagerRelations: managerRelations.length,
                totalCompanyEmployees: allCompanyEmployees.length,
                totalCompanyExpenses: allCompanyExpenses.length,
            },
        };
    }
    async getExpenseById(expenseId, userId, userRole) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const expense = await this.prisma.expense.findUnique({
            where: { id: expenseId },
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
        });
        if (!expense) {
            throw new Error('Expense not found');
        }
        if (userRole !== 'ADMIN' && expense.employee_id !== userId) {
            throw new Error('Access denied: You can only view your own expenses');
        }
        if (expense.company_id !== user.company_id) {
            throw new Error('Access denied: Expense not in your company');
        }
        return this.transformExpenses([expense])[0];
    }
    async overrideApproval(expenseId, adminUserId, status, comments) {
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminUserId },
        });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new Error('Only admins can override approvals');
        }
        const expense = await this.prisma.expense.findUnique({
            where: { id: expenseId },
        });
        if (!expense) {
            throw new Error('Expense not found');
        }
        if (expense.company_id !== adminUser.company_id) {
            throw new Error('Access denied: Expense not in your company');
        }
        const updatedExpense = await this.prisma.expense.update({
            where: { id: expenseId },
            data: { status },
        });
        await this.prisma.expenseApproval.updateMany({
            where: {
                expense_id: expenseId,
                status: 'PENDING',
            },
            data: {
                status,
                comments: comments || `Overridden by admin: ${adminUser.name}`,
                approved_at: new Date(),
            },
        });
        await this.prisma.expenseApproval.create({
            data: {
                expense_id: expenseId,
                approver_id: adminUserId,
                status,
                comments: comments || `Admin override: ${status.toLowerCase()}`,
                approved_at: new Date(),
                step_order: 999,
            },
        });
        return {
            message: `Expense ${status.toLowerCase()} by admin override`,
            expense: updatedExpense,
        };
    }
    async processReceiptOCR(file, userId) {
        let worker = null;
        try {
            if (!file) {
                throw new Error('No file provided');
            }
            console.log('Processing OCR for file:', file.originalname, 'Size:', file.size, 'bytes');
            if (!file.mimetype.startsWith('image/')) {
                throw new Error('Only image files are supported for OCR processing');
            }
            console.log('Creating Tesseract worker...');
            worker = await (0, tesseract_js_1.createWorker)('eng');
            console.log('Tesseract worker created successfully');
            console.log('Starting Tesseract OCR processing...');
            const ocrPromise = worker.recognize(file.buffer);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('OCR processing timeout after 30 seconds')), 30000);
            });
            const result = await Promise.race([ocrPromise, timeoutPromise]);
            const { text, confidence } = result.data;
            console.log('Tesseract OCR processing completed');
            console.log('OCR Text extracted:', text.substring(0, 200) + '...');
            console.log('OCR Confidence:', confidence);
            const parsedData = this.parseReceiptText(text);
            const ocrData = {
                amount: parsedData.amount,
                date: parsedData.date || new Date().toISOString().split('T')[0],
                description: parsedData.description,
                vendor: parsedData.vendor,
                category: parsedData.category,
                confidence: Math.round(confidence),
                rawText: text,
                processingTime: Date.now(),
            };
            console.log('Parsed OCR data:', ocrData);
            return {
                success: true,
                data: ocrData,
                message: 'Receipt processed successfully with OCR',
            };
        }
        catch (error) {
            console.error('OCR processing failed:', error);
            let errorMessage = 'Failed to process receipt with OCR';
            if (error.message?.includes('timeout')) {
                errorMessage = 'OCR processing took too long. Please try with a clearer image.';
            }
            else if (error.message?.includes('image')) {
                errorMessage = 'Unable to process the image. Please ensure it\'s a clear receipt image.';
            }
            else if (error.message?.includes('worker')) {
                errorMessage = 'OCR service unavailable. Please try again later.';
            }
            return {
                success: false,
                error: errorMessage,
            };
        }
        finally {
            if (worker) {
                try {
                    console.log('Terminating Tesseract worker...');
                    await worker.terminate();
                    console.log('Tesseract worker terminated successfully');
                }
                catch (cleanupError) {
                    console.error('Error terminating Tesseract worker:', cleanupError);
                }
            }
        }
    }
    parseReceiptText(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        return {
            amount: this.extractAmountFromText(text),
            date: this.extractDateFromText(text),
            description: this.extractDescriptionFromText(lines),
            vendor: this.extractVendorFromText(lines),
            category: this.categorizeFromText(text),
        };
    }
    extractAmountFromText(text) {
        const patterns = [
            /(?:total|amount|sum|grand\s*total)[:\s]*(?:₹|rs\.?|inr|\$|usd|eur|€|gbp|£)\s*(\d+(?:[.,]\d{2})?)/i,
            /(?:₹|rs\.?|inr|\$|usd|eur|€|gbp|£)\s*(\d+(?:[.,]\d{2})?)\s*(?:total|amount|sum)/i,
            /(?:₹|rs\.?|inr)\s*(\d{2,}(?:[.,]\d{2})?)/i,
            /(?:\$|usd)\s*(\d{1,}(?:[.,]\d{2})?)/i,
            /(?:€|eur)\s*(\d{1,}(?:[.,]\d{2})?)/i,
            /(?:£|gbp)\s*(\d{1,}(?:[.,]\d{2})?)/i,
            /(?:total|amount|sum|grand\s*total)[:\s]*(\d+(?:[.,]\d{2})?)/i,
            /(\d+(?:[.,]\d{2})?)\s*(?:total|amount|sum)/i,
            /\b(\d{1,4}[.,]\d{2})\b/g,
        ];
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                if (pattern.global) {
                    const amounts = matches.map(match => {
                        const num = parseFloat(match.replace(/[₹$€£,]/g, '').replace(',', '.'));
                        return isNaN(num) ? 0 : num;
                    }).filter(amount => amount > 0);
                    if (amounts.length > 0) {
                        return Math.max(...amounts);
                    }
                }
                else {
                    const amount = parseFloat(matches[1].replace(/[₹$€£,]/g, '').replace(',', '.'));
                    if (!isNaN(amount) && amount > 0 && amount < 100000) {
                        return amount;
                    }
                }
            }
        }
        return null;
    }
    extractDateFromText(text) {
        const patterns = [
            /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
            /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4})/i,
            /((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{2,4})/i,
            /(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4})/i,
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                try {
                    const date = new Date(match[1]);
                    if (!isNaN(date.getTime()) && date.getFullYear() > 2000 && date.getFullYear() <= new Date().getFullYear()) {
                        return date.toISOString().split('T')[0];
                    }
                }
                catch (error) {
                    continue;
                }
            }
        }
        return null;
    }
    extractVendorFromText(lines) {
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            if (!line.match(/^\d+/) &&
                !line.match(/^\+?\d/) &&
                !line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) &&
                !line.match(/₹|rs\.?|\$|€|£|total|amount/i) &&
                !line.match(/phone|tel|address|receipt|invoice|bill/i) &&
                line.length > 2 &&
                line.length < 50 &&
                line.match(/[a-zA-Z]/)) {
                return line.trim();
            }
        }
        return null;
    }
    extractDescriptionFromText(lines) {
        const itemLines = [];
        let inItemSection = false;
        for (const line of lines) {
            if (line.match(/receipt|invoice|bill|thank you|visit again|total|subtotal|tax|gst/i)) {
                if (line.match(/total|subtotal|tax|gst/i)) {
                    break;
                }
                continue;
            }
            if (line.match(/\d+[.,]\d{2}/) && line.length > 5) {
                inItemSection = true;
                const itemMatch = line.match(/^(.+?)\s+(?:₹|rs\.?|\$|€|£)?\s*\d+[.,]\d{2}/i);
                if (itemMatch && itemMatch[1]) {
                    itemLines.push(itemMatch[1].trim());
                }
            }
            else if (inItemSection && line.length > 3 && !line.match(/\d+[.,]\d{2}/)) {
                if (itemLines.length < 3) {
                    itemLines.push(line.trim());
                }
            }
        }
        if (itemLines.length > 0) {
            return itemLines.slice(0, 3).join(', ');
        }
        return null;
    }
    categorizeFromText(text) {
        const lowerText = text.toLowerCase();
        const categories = {
            'Food': [
                'restaurant', 'cafe', 'coffee', 'food', 'dining', 'pizza', 'burger',
                'meal', 'lunch', 'dinner', 'breakfast', 'kitchen', 'bistro', 'bar',
                'mcdonald', 'kfc', 'subway', 'starbucks', 'dominos', 'pizza hut'
            ],
            'Travel': [
                'taxi', 'uber', 'ola', 'fuel', 'petrol', 'diesel', 'gas', 'station',
                'train', 'flight', 'airline', 'hotel', 'motel', 'booking', 'travel',
                'cab', 'auto', 'rickshaw', 'bus', 'transport'
            ],
            'Office': [
                'stationery', 'office', 'supplies', 'equipment', 'computer', 'software',
                'printing', 'paper', 'pen', 'stapler', 'folder', 'notebook', 'desk',
                'chair', 'electronics', 'amazon', 'flipkart'
            ],
            'Medical': [
                'hospital', 'pharmacy', 'medical', 'doctor', 'clinic', 'medicine',
                'health', 'drug', 'prescription', 'treatment', 'consultation',
                'apollo', 'fortis', 'max', 'medplus'
            ],
            'Entertainment': [
                'movie', 'cinema', 'entertainment', 'theater', 'theatre', 'game',
                'sport', 'gym', 'club', 'recreation', 'fun', 'pvr', 'inox'
            ],
            'Utilities': [
                'electricity', 'water', 'gas', 'internet', 'phone', 'mobile',
                'telecom', 'broadband', 'wifi', 'utility', 'bill', 'payment'
            ]
        };
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return category;
            }
        }
        return 'Other';
    }
    transformExpenses(expenses) {
        return expenses.map(expense => ({
            id: expense.id,
            employeeId: expense.employee_id,
            companyId: expense.company_id,
            category: expense.category,
            description: expense.description,
            amount: expense.amount.toString(),
            currencyCode: expense.currency_code,
            convertedAmount: expense.converted_amount?.toString(),
            date: expense.date.toISOString(),
            status: expense.status,
            createdAt: expense.created_at.toISOString(),
            updatedAt: expense.updated_at.toISOString(),
            employee: expense.employee,
            company: {
                id: expense.company.id,
                name: expense.company.name,
                currencyCode: expense.company.currency_code,
                currencySymbol: expense.company.currency_symbol,
            },
            approvals: expense.approvals.map(approval => ({
                id: approval.id,
                expenseId: approval.expense_id,
                approverId: approval.approver_id,
                stepOrder: approval.step_order,
                status: approval.status,
                comments: approval.comments,
                approvedAt: approval.approved_at?.toISOString(),
                createdAt: approval.created_at.toISOString(),
                updatedAt: approval.updated_at.toISOString(),
                approver: approval.approver,
            })),
            attachments: expense.attachments.map(attachment => ({
                id: attachment.id,
                expenseId: attachment.expense_id,
                fileUrl: attachment.file_url,
                ocrData: attachment.ocr_data,
                createdAt: attachment.created_at.toISOString(),
            })),
        }));
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        exchange_rates_service_1.ExchangeRatesService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map