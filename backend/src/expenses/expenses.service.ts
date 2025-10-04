// src/expenses/expenses.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import * as fs from 'fs';
import * as path from 'path';
import { createWorker } from 'tesseract.js';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private exchangeRatesService: ExchangeRatesService,
  ) {}

  async createExpense(employeeId: number, dto: CreateExpenseDto, isDraft: boolean = false) {
    const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
    const company = await this.prisma.company.findUnique({ where: { id: employee.company_id } });

    let convertedAmount = dto.amount;
    if (dto.currency_code !== company.currency_code) {
      convertedAmount = await this.exchangeRatesService.convertAmount(
        dto.amount,
        dto.currency_code,
        company.currency_code,
      );
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

    // Only trigger approval workflow if not a draft
    if (!isDraft) {
      await this.prisma.$transaction(async (tx) => {
      const flows = await tx.approvalFlow.findMany({
        where: { company_id: company.id },
        orderBy: { step_order: 'asc' },
      });

      // If no approval flows exist, create a default one with the admin user
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
      } else {
        // Process existing approval flows
        for (const flow of flows) {
          let approverId: number | null = null;

          if (flow.is_manager_approver) {
            // For now, assume employee's manager = company admin (simplified)
            const manager = await tx.user.findFirst({
              where: { company_id: company.id, role: 'MANAGER' },
            });
            if (manager) approverId = manager.id;
          } else if (flow.specific_user_id) {
            approverId = flow.specific_user_id;
          } else {
            const user = await tx.user.findFirst({
              where: { company_id: company.id, role: flow.approver_role as any },
            });
            if (user) approverId = user.id;
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

  async getMyExpenses(employeeId: number) {
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

  async getDraftExpenses(employeeId: number) {
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

  async getDraftExpensesTotal(employeeId: number) {
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

  async submitDraftExpense(expenseId: number, employeeId: number) {
    // First verify the expense belongs to the employee and is a draft
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

    // Update status to PENDING
    const updatedExpense = await this.prisma.expense.update({
      where: { id: expenseId },
      data: { status: 'PENDING' },
    });

    // Now trigger approval workflow
    await this.prisma.$transaction(async (tx) => {
      const flows = await tx.approvalFlow.findMany({
        where: { company_id: expense.company_id },
        orderBy: { step_order: 'asc' },
      });

      // If no approval flows exist, create a default one with the admin user
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
      } else {
        // Process existing approval flows
        for (const flow of flows) {
          let approverId: number | null = null;

          if (flow.is_manager_approver) {
            // For now, assume employee's manager = company admin (simplified)
            const manager = await tx.user.findFirst({
              where: { company_id: expense.company_id, role: 'MANAGER' },
            });
            if (manager) approverId = manager.id;
          } else if (flow.specific_user_id) {
            approverId = flow.specific_user_id;
          } else {
            const user = await tx.user.findFirst({
              where: { company_id: expense.company_id, role: flow.approver_role as any },
            });
            if (user) approverId = user.id;
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

  async updateDraftExpense(expenseId: number, employeeId: number, dto: CreateExpenseDto) {
    // First verify the expense belongs to the employee and is a draft
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

    // Get company info for currency conversion
    const company = await this.prisma.company.findUnique({ 
      where: { id: expense.company_id } 
    });

    // Calculate converted amount if currency changed
    let convertedAmount = dto.amount;
    if (dto.currency_code !== company.currency_code) {
      convertedAmount = await this.exchangeRatesService.convertAmount(
        dto.amount,
        dto.currency_code,
        company.currency_code,
      );
    }

    // Update the draft expense
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

  /**
   * Get all company expenses (Admin only)
   */
  async getAllCompanyExpenses(adminUserId: number) {
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

  /**
   * Get expense by ID with permission checks
   */
  async getExpenseById(expenseId: number, userId: number, userRole: string) {
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

    // Check permissions
    if (userRole !== 'ADMIN' && expense.employee_id !== userId) {
      throw new Error('Access denied: You can only view your own expenses');
    }

    // Additional check for same company
    if (expense.company_id !== user.company_id) {
      throw new Error('Access denied: Expense not in your company');
    }

    return this.transformExpenses([expense])[0];
  }

  /**
   * Override expense approval (Admin only)
   */
  async overrideApproval(expenseId: number, adminUserId: number, status: 'APPROVED' | 'REJECTED', comments?: string) {
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

    // Update expense status
    const updatedExpense = await this.prisma.expense.update({
      where: { id: expenseId },
      data: { status },
    });

    // Update all pending approvals
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

    // Create an approval record for the admin override
    await this.prisma.expenseApproval.create({
      data: {
        expense_id: expenseId,
        approver_id: adminUserId,
        status,
        comments: comments || `Admin override: ${status.toLowerCase()}`,
        approved_at: new Date(),
        step_order: 999, // High number to indicate admin override
      },
    });

    return {
      message: `Expense ${status.toLowerCase()} by admin override`,
      expense: updatedExpense,
    };
  }

  /**
   * Process receipt with OCR using Tesseract.js
   */
  async processReceiptOCR(file: any, userId: number) {
    let worker = null;
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Processing OCR for file:', file.originalname, 'Size:', file.size, 'bytes');

      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('Only image files are supported for OCR processing');
      }

      // Create Tesseract worker
      console.log('Creating Tesseract worker...');
      worker = await createWorker('eng');
      console.log('Tesseract worker created successfully');

      // Process the image buffer with Tesseract.js with timeout
      // Tesseract can handle various image formats (JPEG, PNG, TIFF, BMP, etc.)
      console.log('Starting Tesseract OCR processing...');
      
      const ocrPromise = worker.recognize(file.buffer);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OCR processing timeout after 30 seconds')), 30000);
      });
      
      const result = await Promise.race([ocrPromise, timeoutPromise]) as any;
      const { text, confidence } = result.data;
      console.log('Tesseract OCR processing completed');
      
      console.log('OCR Text extracted:', text.substring(0, 200) + '...');
      console.log('OCR Confidence:', confidence);

      // Parse the extracted text to get expense data
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
    } catch (error) {
      console.error('OCR processing failed:', error);
      
      let errorMessage = 'Failed to process receipt with OCR';
      if (error.message?.includes('timeout')) {
        errorMessage = 'OCR processing took too long. Please try with a clearer image.';
      } else if (error.message?.includes('image')) {
        errorMessage = 'Unable to process the image. Please ensure it\'s a clear receipt image.';
      } else if (error.message?.includes('worker')) {
        errorMessage = 'OCR service unavailable. Please try again later.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Clean up Tesseract worker
      if (worker) {
        try {
          console.log('Terminating Tesseract worker...');
          await worker.terminate();
          console.log('Tesseract worker terminated successfully');
        } catch (cleanupError) {
          console.error('Error terminating Tesseract worker:', cleanupError);
        }
      }
    }
  }

  /**
   * Parse extracted OCR text to identify expense data
   */
  private parseReceiptText(text: string) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return {
      amount: this.extractAmountFromText(text),
      date: this.extractDateFromText(text),
      description: this.extractDescriptionFromText(lines),
      vendor: this.extractVendorFromText(lines),
      category: this.categorizeFromText(text),
    };
  }

  /**
   * Extract amount from OCR text using various patterns
   */
  private extractAmountFromText(text: string): number | null {
    // Enhanced patterns for different currency formats and contexts
    const patterns = [
      // Total patterns with currency symbols
      /(?:total|amount|sum|grand\s*total)[:\s]*(?:₹|rs\.?|inr|\$|usd|eur|€|gbp|£)\s*(\d+(?:[.,]\d{2})?)/i,
      /(?:₹|rs\.?|inr|\$|usd|eur|€|gbp|£)\s*(\d+(?:[.,]\d{2})?)\s*(?:total|amount|sum)/i,
      
      // Standalone currency amounts (looking for larger amounts that could be totals)
      /(?:₹|rs\.?|inr)\s*(\d{2,}(?:[.,]\d{2})?)/i,
      /(?:\$|usd)\s*(\d{1,}(?:[.,]\d{2})?)/i,
      /(?:€|eur)\s*(\d{1,}(?:[.,]\d{2})?)/i,
      /(?:£|gbp)\s*(\d{1,}(?:[.,]\d{2})?)/i,
      
      // Patterns without currency symbols but with context
      /(?:total|amount|sum|grand\s*total)[:\s]*(\d+(?:[.,]\d{2})?)/i,
      /(\d+(?:[.,]\d{2})?)\s*(?:total|amount|sum)/i,
      
      // Last resort: any decimal number that looks like a price
      /\b(\d{1,4}[.,]\d{2})\b/g,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        // For global patterns, get all matches and pick the largest (likely the total)
        if (pattern.global) {
          const amounts = matches.map(match => {
            const num = parseFloat(match.replace(/[₹$€£,]/g, '').replace(',', '.'));
            return isNaN(num) ? 0 : num;
          }).filter(amount => amount > 0);
          
          if (amounts.length > 0) {
            return Math.max(...amounts);
          }
        } else {
          const amount = parseFloat(matches[1].replace(/[₹$€£,]/g, '').replace(',', '.'));
          if (!isNaN(amount) && amount > 0 && amount < 100000) { // Reasonable range
            return amount;
          }
        }
      }
    }

    return null;
  }

  /**
   * Extract date from OCR text
   */
  private extractDateFromText(text: string): string | null {
    const patterns = [
      // DD/MM/YYYY or DD-MM-YYYY
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      // DD MMM YYYY
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4})/i,
      // Month DD, YYYY
      /((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{2,4})/i,
      // DD Month YYYY
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        try {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime()) && date.getFullYear() > 2000 && date.getFullYear() <= new Date().getFullYear()) {
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          }
        } catch (error) {
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Extract vendor/merchant name from OCR text
   */
  private extractVendorFromText(lines: string[]): string | null {
    // Usually the merchant name is in the first few lines and is not a number/address
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      
      // Skip lines that look like addresses, phone numbers, dates, or amounts
      if (
        !line.match(/^\d+/) && // Not starting with number
        !line.match(/^\+?\d/) && // Not phone number
        !line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) && // Not date
        !line.match(/₹|rs\.?|\$|€|£|total|amount/i) && // Not amount line
        !line.match(/phone|tel|address|receipt|invoice|bill/i) && // Not contact info
        line.length > 2 && 
        line.length < 50 &&
        line.match(/[a-zA-Z]/) // Contains letters
      ) {
        return line.trim();
      }
    }
    
    return null;
  }

  /**
   * Extract description/items from OCR text
   */
  private extractDescriptionFromText(lines: string[]): string | null {
    const itemLines = [];
    let inItemSection = false;
    
    for (const line of lines) {
      // Skip headers and footers
      if (line.match(/receipt|invoice|bill|thank you|visit again|total|subtotal|tax|gst/i)) {
        if (line.match(/total|subtotal|tax|gst/i)) {
          break; // Stop when we reach totals section
        }
        continue;
      }
      
      // Look for item lines (usually have some structure like "Item name ... Price")
      if (line.match(/\d+[.,]\d{2}/) && line.length > 5) {
        inItemSection = true;
        // Extract item name (text before the price)
        const itemMatch = line.match(/^(.+?)\s+(?:₹|rs\.?|\$|€|£)?\s*\d+[.,]\d{2}/i);
        if (itemMatch && itemMatch[1]) {
          itemLines.push(itemMatch[1].trim());
        }
      } else if (inItemSection && line.length > 3 && !line.match(/\d+[.,]\d{2}/)) {
        // Might be a continuation of item description
        if (itemLines.length < 3) {
          itemLines.push(line.trim());
        }
      }
    }
    
    if (itemLines.length > 0) {
      return itemLines.slice(0, 3).join(', '); // Take first 3 items
    }
    
    return null;
  }

  /**
   * Categorize expense based on OCR text content
   */
  private categorizeFromText(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Enhanced categorization based on common keywords
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



  /**
   * Transform expenses to camelCase format
   */
  private transformExpenses(expenses: any[]) {
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
}