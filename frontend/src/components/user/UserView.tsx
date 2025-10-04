"use client";

import React, { useState, useRef } from "react";
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

interface ExpenseEntry {
  id: string;
  employee: string;
  description: string;
  date: string;
  category: string;
  paidBy: string;
  remarks: string;
  amount: number;
  status: "Draft" | "Submitted" | "Waiting Approval" | "Approved" | "Rejected";
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

// Sample data - replace with actual API call
const sampleExpenses: ExpenseEntry[] = [
  {
    id: "1",
    employee: "Sarah",
    description: "Restaurant bill",
    date: "16th Oct, 2025",
    category: "Food",
    paidBy: "Sarah",
    remarks: "None",
    amount: 5000,
    status: "Submitted",
  },
  {
    id: "2",
    employee: "Sarah",
    description: "Office supplies",
    date: "15th Oct, 2025",
    category: "Office",
    paidBy: "Sarah",
    remarks: "Urgent purchase",
    amount: 2500,
    status: "Draft",
  },
  {
    id: "3",
    employee: "Sarah",
    description: "Travel expenses",
    date: "14th Oct, 2025",
    category: "Travel",
    paidBy: "Sarah",
    remarks: "Client meeting",
    amount: 15000,
    status: "Waiting Approval",
  },
];

const expenseSummary: ExpenseSummary = {
  toSubmit: 5467,
  waitingApproval: 33674,
  approved: 500,
};

export default function UserView() {
  const [expenses] = useState<ExpenseEntry[]>(sampleExpenses);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const ocrService = OCRService.getInstance();

  const handleBack = () => {
    window.history.back();
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleNew = () => {
    router.push("/user/new-expense");
  };

  const formatCurrency = (amount: number) => {
    return `${amount} rs`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "Rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "Waiting Approval":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Submitted":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "Draft":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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
          console.log("OCR completed for:", newFiles[i].file.name, ocrData);
        } catch (error) {
          console.error("OCR failed for:", newFiles[i].file.name, error);

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
                            Processing...
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
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round(item.ocrData.confidence)}%
                          </span>
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
                        Failed to process receipt. Please try again or enter
                        manually.
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

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 py-4 px-6">
                    Employee
                  </TableHead>
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
                    Paid By
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-6">
                    Remarks
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-6">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-6">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell className="py-4 px-6 font-medium">
                      {expense.employee}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {expense.description}
                    </TableCell>
                    <TableCell className="py-4 px-6">{expense.date}</TableCell>
                    <TableCell className="py-4 px-6">
                      {expense.category}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {expense.paidBy}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {expense.remarks}
                    </TableCell>
                    <TableCell className="py-4 px-6 font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          expense.status
                        )}`}
                      >
                        {expense.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
