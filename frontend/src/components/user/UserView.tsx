"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  FileImage,
  X,
  Scan,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  OCRService,
  ExtractedExpenseData,
} from "@/components/services/ocrService";
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/lib/toast';

interface ExpenseEntry {
  id: number;
  employeeId: number;
  companyId: number;
  category?: string;
  description?: string;
  amount: string;
  currencyCode: string;
  convertedAmount?: string;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  employee: {
    id: number;
    name: string;
    email: string;
  };
  company: {
    id: number;
    name: string;
    currencyCode: string;
    currencySymbol: string;
  };
  approvals: Array<{
    id: number;
    expenseId: number;
    approverId: number;
    stepOrder: number;
    status: string;
    comments?: string;
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;
    approver: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  }>;
  attachments: Array<{
    id: number;
    expenseId: number;
    fileUrl: string;
    ocrData?: any;
    createdAt: string;
  }>;
}

interface UploadedFile {
  file: File;
  ocrData?: ExtractedExpenseData;
  isProcessing?: boolean;
  hasError?: boolean;
}

interface ExpenseSummary {
  toSubmit: number;
  waitingApproval: number;
  approved: number;
}

export default function UserView() {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [draftExpenses, setDraftExpenses] = useState<ExpenseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>({
    toSubmit: 0,
    waitingApproval: 0,
    approved: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, company } = useAuth();
  const ocrService = OCRService.getInstance();

  // Load user expenses on component mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getMyExpenses();
      setExpenses(data);
      
      // Get draft expenses and total
      const draftData = await apiClient.getDraftExpenses();
      setDraftExpenses(draftData);
      const draftTotal = await apiClient.getDraftExpensesTotal();
      
      // Calculate summary
      const summary = data.reduce(
        (acc, expense) => {
          const amount = parseFloat(expense.amount);
          if (expense.status === 'PENDING') {
            acc.waitingApproval += amount;
          } else if (expense.status === 'APPROVED') {
            acc.approved += amount;
          }
          return acc;
        },
        { toSubmit: draftTotal, waitingApproval: 0, approved: 0 }
      );
      setExpenseSummary(summary);
    } catch (error: any) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleNew = () => {
    router.push("/user/new-expense");
  };

  const handleSubmitDraft = async (expenseId: number) => {
    try {
      await apiClient.submitDraftExpense(expenseId);
      toast.success('Draft expense submitted successfully!');
      loadExpenses(); // Refresh the data
    } catch (error: any) {
      console.error('Error submitting draft:', error);
      toast.error(error.message || 'Failed to submit draft expense');
    }
  };

  const formatCurrency = (amount: string | number, currencySymbol?: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currencySymbol || company?.currency?.symbol || '₹'}${numAmount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-50 border-green-200";
      case "REJECTED":
        return "text-red-600 bg-red-50 border-red-200";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      case "PENDING":
        return "Waiting Approval";
      default:
        return status;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        file,
        isProcessing: true,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Process each file with OCR
      for (let i = 0; i < newFiles.length; i++) {
        try {
          const fileIndex = uploadedFiles.length + i;
          const ocrData = await ocrService.extractReceiptData(newFiles[i].file);

          setUploadedFiles((prev) =>
            prev.map((item, index) =>
              index === fileIndex
                ? { ...item, ocrData, isProcessing: false }
                : item
            )
          );

          // Show success notification
          console.log("Real OCR processing completed for:", newFiles[i].file.name, ocrData);
          toast.success(`Receipt processed! Found: ${ocrData.vendor || 'Unknown vendor'}, Amount: ${ocrData.amount || 'N/A'}`);
        } catch (error: any) {
          console.error("Real OCR processing failed for:", newFiles[i].file.name, error);
          toast.error(`OCR failed for ${newFiles[i].file.name}: ${error.message || 'Unknown error'}`);

          setUploadedFiles((prev) =>
            prev.map((item, index) =>
              index === uploadedFiles.length + i
                ? { ...item, isProcessing: false, hasError: true }
                : item
            )
          );
        }
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const createExpenseFromOCR = (ocrData: ExtractedExpenseData) => {
    // Navigate to new expense form with pre-filled data
    const queryParams = new URLSearchParams({
      ...(ocrData.amount && { amount: ocrData.amount.toString() }),
      ...(ocrData.date && { date: ocrData.date }),
      ...(ocrData.description && { description: ocrData.description }),
      ...(ocrData.vendor && { vendor: ocrData.vendor }),
      ...(ocrData.category && { category: ocrData.category }),
    });

    router.push(`/user/new-expense?${queryParams.toString()}`);
  };

  const getOCRStatusIcon = (item: UploadedFile) => {
    if (item.isProcessing) {
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    } else if (item.hasError) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else if (item.ocrData) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <FileImage className="w-4 h-4 text-purple-600" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              My Expenses
            </CardTitle>
            <div className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                multiple
                className="hidden"
              />
              <Button
                onClick={handleUpload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Scan className="w-4 h-4" />
                Scan Receipt
              </Button>
              <Button
                onClick={handleNew}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                New
              </Button>
            </div>
          </div>

          {/* Enhanced Uploaded Files Display with OCR Results */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="text-sm font-medium text-purple-900 mb-3">
                Scanned Receipts:
              </h4>
              <div className="space-y-3">
                {uploadedFiles.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-md border shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getOCRStatusIcon(item)}
                        <span className="text-sm font-medium text-gray-700">
                          {item.file.name}
                        </span>
                        {item.isProcessing && (
                          <span className="text-xs text-blue-600">
                            Processing with OCR...
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* OCR Results */}
                    {item.ocrData && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {item.ocrData.amount && (
                            <div>
                              <span className="font-medium">Amount:</span> ₹
                              {item.ocrData.amount}
                            </div>
                          )}
                          {item.ocrData.date && (
                            <div>
                              <span className="font-medium">Date:</span>{" "}
                              {item.ocrData.date}
                            </div>
                          )}
                          {item.ocrData.vendor && (
                            <div>
                              <span className="font-medium">Vendor:</span>{" "}
                              {item.ocrData.vendor}
                            </div>
                          )}
                          {item.ocrData.category && (
                            <div>
                              <span className="font-medium">Category:</span>{" "}
                              {item.ocrData.category}
                            </div>
                          )}
                        </div>
                        {item.ocrData.description && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Items:</span>{" "}
                            {item.ocrData.description}
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-xs text-gray-500">
                            <div>OCR Confidence: {Math.round(item.ocrData.confidence)}%</div>
                            <div className="text-green-600">✓ Processed with Tesseract.js</div>
                          </div>
                          <Button
                            onClick={() => createExpenseFromOCR(item.ocrData!)}
                            size="sm"
                            className="h-8 text-xs bg-purple-600 hover:bg-purple-700"
                          >
                            Create Expense
                          </Button>
                        </div>
                      </div>
                    )}

                    {item.hasError && (
                      <div className="mt-2 text-xs text-red-600">
                        Failed to process receipt with OCR. The image might be unclear or the text unreadable. 
                        Please try again with a clearer image or enter the details manually.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>

        {/* Status Progress Bar */}
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            {/* To Submit */}
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(expenseSummary.toSubmit)}
              </div>
              <div className="text-sm text-gray-600">To submit</div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Waiting Approval */}
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(expenseSummary.waitingApproval)}
              </div>
              <div className="text-sm text-gray-600">Waiting approval</div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Approved */}
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(expenseSummary.approved)}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        </div>

        {/* Draft Expenses Section */}
        {draftExpenses.length > 0 && (
          <div className="px-6 py-4 border-b bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Draft Expenses ({draftExpenses.length})
            </h3>
            <div className="space-y-2">
              {draftExpenses.map((expense) => (
                <div key={expense.id} className="bg-white p-4 rounded-lg border border-blue-200 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {expense.description || 'No description'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })} • {expense.category || 'No category'}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(expense.amount, expense.company.currencySymbol)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/user/new-expense?draft=${expense.id}`)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitDraft(expense.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading expenses...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Description
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Category
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Approvals
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <TableCell className="py-4 px-6">
                        {expense.description || 'N/A'}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {new Date(expense.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {expense.category || 'N/A'}
                      </TableCell>
                      <TableCell className="py-4 px-6 font-semibold">
                        <div>
                          {formatCurrency(expense.amount, expense.company.currencySymbol)}
                        </div>
                        {expense.currencyCode !== expense.company.currencyCode && expense.convertedAmount && (
                          <div className="text-sm text-gray-500">
                            {expense.currencyCode} {parseFloat(expense.amount).toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            expense.status
                          )}`}
                        >
                          {getStatusDisplayName(expense.status)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="text-sm">
                          {expense.approvals.length > 0 ? (
                            <div>
                              {expense.approvals.map((approval) => (
                                <div key={approval.id} className="mb-1">
                                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    approval.status === 'APPROVED' ? 'bg-green-500' :
                                    approval.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                                  }`}></span>
                                  <span className="text-xs">
                                    {approval.approver.name} ({approval.approver.role})
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No approvals yet</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {expenses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No expenses found</p>
              <p className="text-gray-400 text-sm mt-2">
                Click &quot;New&quot; to add your first expense
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
