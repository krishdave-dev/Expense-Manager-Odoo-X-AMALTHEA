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
import { Check, X, Eye, ArrowLeft } from "lucide-react";

interface ExpenseRequest {
  id: string;
  approvalSubject: string;
  requestOwner: string;
  category: string;
  requestStatus: "Pending" | "Approved" | "Rejected";
  totalAmount: number;
  currency: string;
}

// Sample data - replace with actual API call
const sampleExpenses: ExpenseRequest[] = [
  {
    id: "1",
    approvalSubject: "Client Meeting Lunch",
    requestOwner: "Sarah",
    category: "Food",
    requestStatus: "Pending",
    totalAmount: 49896,
    currency: "INR",
  },
  {
    id: "2",
    approvalSubject: "Office Supplies",
    requestOwner: "John",
    category: "Office",
    requestStatus: "Pending",
    totalAmount: 12500,
    currency: "INR",
  },
  {
    id: "3",
    approvalSubject: "Travel Expenses",
    requestOwner: "Mike",
    category: "Travel",
    requestStatus: "Pending",
    totalAmount: 85000,
    currency: "INR",
  },
  {
    id: "4",
    approvalSubject: "Software License",
    requestOwner: "Emma",
    category: "Technology",
    requestStatus: "Pending",
    totalAmount: 25000,
    currency: "INR",
  },
];

export default function ManagerView() {
  const [expenses, setExpenses] = useState<ExpenseRequest[]>(sampleExpenses);

  const handleApprove = (id: string) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id
          ? { ...expense, requestStatus: "Approved" as const }
          : expense
      )
    );
  };

  const handleReject = (id: string) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id
          ? { ...expense, requestStatus: "Rejected" as const }
          : expense
      )
    );
  };

  const handleBack = () => {
    // You can customize this to navigate to a specific route
    // For now, it goes back in browser history
    window.history.back();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-50";
      case "Rejected":
        return "text-red-600 bg-red-50";
      case "Pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
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
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Approvals to review
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="font-semibold text-gray-700 py-4 px-6">
                    Approval Subject
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-6">
                    Request Owner
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-6">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-6">
                    Request Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-6">
                    Total Amount
                    <br />
                    <span className="text-sm text-gray-500">(in company's currency)</span>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} className="border-b hover:bg-gray-50">
                    <TableCell className="py-4 px-6 font-medium">
                      {expense.approvalSubject}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {expense.requestOwner}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {expense.category}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          expense.requestStatus
                        )}`}
                      >
                        {expense.requestStatus}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 font-semibold">
                      {formatCurrency(expense.totalAmount, expense.currency)}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2 justify-center">
                        {expense.requestStatus === "Pending" ? (
                          <>
                            <Button
                              onClick={() => handleApprove(expense.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(expense.id)}
                              size="sm"
                              variant="destructive"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {expenses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No expense requests to review</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
