"use client";

import React, { useState } from "react";
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
import { Upload, Plus, ArrowLeft, ArrowRight } from "lucide-react";

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
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(sampleExpenses);

  const handleBack = () => {
    window.history.back();
  };

  const handleUpload = () => {
    // Handle file upload logic
    console.log("Upload expenses");
  };

  const handleNew = () => {
    // Handle creating new expense
    console.log("Create new expense");
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
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Draft":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
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
        {/* Header with Upload and New buttons */}
        <CardHeader className="border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              My Expenses
            </CardTitle>
            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <Button
                onClick={handleNew}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New
              </Button>
            </div>
          </div>
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
                  <TableRow key={expense.id} className="border-b hover:bg-gray-50">
                    <TableCell className="py-4 px-6 font-medium">
                      {expense.employee}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {expense.description}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {expense.date}
                    </TableCell>
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
              <p className="text-gray-400 text-sm mt-2">Click "New" to add your first expense</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}