"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, ChevronDown } from "lucide-react";

interface ExpenseForm {
  description: string;
  category: string;
  totalAmount: string;
  currency: string;
  expenseDate: string;
  paidBy: string;
  remarks: string;
}

interface ApprovalInfo {
  approver: string;
  status: string;
  time: string;
}

export default function UserView2() {
  const [formData, setFormData] = useState<ExpenseForm>({
    description: "",
    category: "",
    totalAmount: "567",
    currency: "INR",
    expenseDate: "",
    paidBy: "",
    remarks: "",
  });

  const [approvalInfo] = useState<ApprovalInfo>({
    approver: "Sarah",
    status: "Approved",
    time: "12:44 4th Oct, 2025",
  });

  const handleBack = () => {
    window.history.back();
  };

  const handleAttachReceipt = () => {
    // Handle file upload
    console.log("Attach receipt");
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log("Submit expense", formData);
  };

  const handleInputChange = (field: keyof ExpenseForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={handleAttachReceipt}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Attach Receipt
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-3 py-1 bg-gray-100 rounded">Draft</span>
              <span>→</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded">Waiting approval</span>
              <span>→</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded">Approved</span>
            </div>
          </div>

          {/* Main Form */}
          <div className="border rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full border-b border-gray-300 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:border-blue-500"
                    placeholder="Enter description"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Input
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full border-b border-gray-300 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:border-blue-500"
                      placeholder="Select category"
                    />
                    <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total amount in 
                    <span className="relative">
                      <select className="mx-1 border-none bg-transparent text-blue-600 underline cursor-pointer">
                        <option>currency selection</option>
                        <option>INR</option>
                        <option>USD</option>
                        <option>EUR</option>
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 text-blue-600 pointer-events-none" />
                    </span>
                  </label>
                  <Input
                    value={formData.totalAmount}
                    onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                    className="w-full border-b border-gray-300 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:border-blue-500 text-lg font-semibold"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Expense Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Date
                  </label>
                  <Input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                    className="w-full border-b border-gray-300 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:border-blue-500"
                  />
                </div>

                {/* Paid By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paid by:
                  </label>
                  <div className="relative">
                    <Input
                      value={formData.paidBy}
                      onChange={(e) => handleInputChange('paidBy', e.target.value)}
                      className="w-full border-b border-gray-300 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:border-blue-500"
                      placeholder="Select who paid"
                    />
                    <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <Input
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    className="w-full border-b border-gray-300 border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:border-blue-500"
                    placeholder="Add remarks"
                  />
                </div>
              </div>
            </div>

            {/* Additional Description Section */}
            <div className="mt-8 pt-6 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="bg-red-50 border border-red-200 rounded p-4 text-sm">
                  <p className="text-red-700 mb-2">
                    <span className="font-medium">Employee can submit expense in any currency</span>
                  </p>
                  <p className="text-red-600">
                    (currency in which he spent the money in receipt)
                  </p>
                  <p className="text-red-600 mt-2">
                    In manager's approval dashboard, the amount should get auto-converted to base currency of the company with exchange today's currency conversion rates.
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Info */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex gap-8">
                  <div>
                    <span className="font-medium">Approver</span>
                    <div className="mt-1">{approvalInfo.approver}</div>
                  </div>
                  <div>
                    <span className="font-medium">Status</span>
                    <div className="mt-1 text-green-600 font-medium">{approvalInfo.status}</div>
                  </div>
                  <div>
                    <span className="font-medium">Time</span>
                    <div className="mt-1">{approvalInfo.time}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-start">
            <Button
              onClick={handleSubmit}
              className="bg-gray-800 hover:bg-gray-900 text-white px-12 py-3 rounded-full text-lg font-medium"
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}