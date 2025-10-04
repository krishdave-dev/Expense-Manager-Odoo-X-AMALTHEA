"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Eye, ArrowLeft, Loader2, MessageSquare, Users, FileText } from "lucide-react";
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/lib/toast';

interface PendingApproval {
  id: number;
  expenseId: number;
  approverId: number;
  stepOrder: number;
  status: string;
  comments?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  expense: {
    id: number;
    employeeId: number;
    companyId: number;
    category?: string;
    description?: string;
    amount: string;
    currencyCode: string;
    convertedAmount?: string;
    date: string;
    status: string;
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
      currencySymbol?: string;
    };
  };
}

interface TeamExpense {
  id: number;
  employeeId: number;
  companyId: number;
  category?: string;
  description?: string;
  amount: string;
  currencyCode: string;
  convertedAmount?: string;
  date: string;
  status: string;
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
    currencySymbol?: string;
  };
  approvals: Array<{
    id: number;
    status: string;
    comments?: string;
    approver: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  }>;
}

interface ApprovalModal {
  isOpen: boolean;
  expense?: PendingApproval;
  action?: 'APPROVE' | 'REJECT';
}

export default function ManagerView() {
  const { user, company } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [teamExpenses, setTeamExpenses] = useState<TeamExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'team'>('pending');
  const [approvalModal, setApprovalModal] = useState<ApprovalModal>({ isOpen: false });
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('Manager view loaded for user:', user);
    console.log('Active tab:', activeTab);
    
    if (activeTab === 'pending') {
      loadPendingApprovals();
    } else {
      loadTeamExpenses();
    }
  }, [activeTab]);

  const loadPendingApprovals = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getPendingApprovals();
      setPendingApprovals(data);
    } catch (error: any) {
      console.error('Error loading pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamExpenses = async () => {
    try {
      setIsLoadingTeam(true);
      console.log('Loading team expenses...');
      const data = await apiClient.getTeamExpenses();
      console.log('Team expenses loaded:', data);
      setTeamExpenses(data.expenses);
      toast.success(`Loaded ${data.expenses.length} team expenses`);
    } catch (error: any) {
      console.error('Error loading team expenses:', error);
      toast.error(`Failed to load team expenses: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const openApprovalModal = (expense: PendingApproval, action: 'APPROVE' | 'REJECT') => {
    setApprovalModal({ isOpen: true, expense, action });
    setComments('');
  };

  const closeApprovalModal = () => {
    setApprovalModal({ isOpen: false });
    setComments('');
  };

  const handleApprovalSubmit = async () => {
    if (!approvalModal.expense || !approvalModal.action) return;

    setIsSubmitting(true);
    try {
      await apiClient.approveExpense(
        approvalModal.expense.expenseId,
        approvalModal.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        comments
      );

      toast.success(`Expense ${approvalModal.action.toLowerCase()}d successfully!`);
      closeApprovalModal();
      loadPendingApprovals(); // Refresh the list
    } catch (error: any) {
      console.error('Error processing approval:', error);
      toast.error(error.message || 'Failed to process approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // You can customize this to navigate to a specific route
    // For now, it goes back in browser history
    window.history.back();
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    // If currency code is provided and different from company currency, show that currency
    if (currencyCode && currencyCode !== company?.currency?.code) {
      // For non-company currencies, we don't have the symbol, so just use the code
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
    // For company currency, use the symbol
    const currencySymbol = company?.currency?.symbol || '₹';
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "text-green-600 bg-green-50 border-green-200";
      case "REJECTED":
        return "text-red-600 bg-red-50 border-red-200";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "DRAFT":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      case "PENDING":
        return "Pending";
      case "DRAFT":
        return "Draft";
      default:
        return status;
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

      {/* Tab Navigation */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Pending Approvals ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'team'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Team Expenses
          </button>
        </div>
        
        <Button
          onClick={async () => {
            try {
              const debugInfo = await apiClient.getManagerDebugInfo();
              console.log('Manager Debug Info:', debugInfo);
              toast.success('Debug info logged to console');
            } catch (error) {
              console.error('Debug error:', error);
              toast.error('Debug failed');
            }
          }}
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-300"
        >
          Debug Info
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {activeTab === 'pending' ? 'Pending Approvals' : 'Team Expenses'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {activeTab === 'pending' ? (
              isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading pending approvals...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="font-semibold text-gray-700 py-4 px-6">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 px-6">
                        Employee
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 px-6">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 px-6">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 px-6">
                        Amount
                        <br />
                        <span className="text-sm text-gray-500">(in company currency)</span>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 px-6 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((approval) => (
                      <TableRow key={approval.id} className="border-b hover:bg-gray-50">
                        <TableCell className="py-4 px-6 font-medium">
                          {approval.expense.description || 'No description'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div>
                            <div className="font-medium">{approval.expense.employee.name}</div>
                            <div className="text-sm text-gray-500">{approval.expense.employee.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {approval.expense.category || 'N/A'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {new Date(approval.expense.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="py-4 px-6 font-semibold">
                          <div>
                            {formatCurrency(
                              parseFloat(approval.expense.convertedAmount || approval.expense.amount),
                              approval.expense.company.currencyCode
                            )}
                          </div>
                          {approval.expense.currencyCode !== approval.expense.company.currencyCode && (
                            <div className="text-sm text-gray-500">
                              Original: {formatCurrency(parseFloat(approval.expense.amount), approval.expense.currencyCode)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2 justify-center">
                            <Button
                              onClick={() => openApprovalModal(approval, 'APPROVE')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => openApprovalModal(approval, 'REJECT')}
                              size="sm"
                              variant="destructive"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : (
              isLoadingTeam ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading team expenses...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="font-semibold text-gray-700 py-4 px-6">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 px-6">
                        Employee
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 px-6">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 px-6">
                        Date
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
                    {teamExpenses.map((expense) => (
                      <TableRow key={expense.id} className="border-b hover:bg-gray-50">
                        <TableCell className="py-4 px-6 font-medium">
                          {expense.description || 'No description'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div>
                            <div className="font-medium">{expense.employee.name}</div>
                            <div className="text-sm text-gray-500">{expense.employee.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {expense.category || 'N/A'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {new Date(expense.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="py-4 px-6 font-semibold">
                          <div>
                            {formatCurrency(
                              parseFloat(expense.convertedAmount || expense.amount),
                              expense.company.currencyCode
                            )}
                          </div>
                          {expense.currencyCode !== expense.company.currencyCode && (
                            <div className="text-sm text-gray-500">
                              Original: {formatCurrency(parseFloat(expense.amount), expense.currencyCode)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(expense.status)}`}
                          >
                            {getStatusDisplayName(expense.status)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="text-sm">
                            {expense.approvals.length > 0 ? (
                              <div>
                                {expense.approvals.map((approval, index) => (
                                  <div key={index} className="mb-1">
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
              )
            )}
          </div>
          
          {((activeTab === 'pending' && pendingApprovals.length === 0 && !isLoading) ||
            (activeTab === 'team' && teamExpenses.length === 0 && !isLoadingTeam)) && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {activeTab === 'pending' ? 'No pending approvals' : 'No team expenses found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      {approvalModal.isOpen && approvalModal.expense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {approvalModal.action === 'APPROVE' ? 'Approve' : 'Reject'} Expense
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">
                {approvalModal.expense.expense.description || 'No description'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Employee: {approvalModal.expense.expense.employee.name}
              </p>
              <p className="text-sm text-gray-600">
                Amount: {formatCurrency(
                  parseFloat(approvalModal.expense.expense.convertedAmount || approvalModal.expense.expense.amount),
                  approvalModal.expense.expense.company.currencyCode
                )}
              </p>
              <p className="text-sm text-gray-600">
                Date: {new Date(approvalModal.expense.expense.date).toLocaleDateString()}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments {approvalModal.action === 'REJECT' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={`Add ${approvalModal.action === 'APPROVE' ? 'optional' : 'required'} comments...`}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={closeApprovalModal}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprovalSubmit}
                disabled={isSubmitting || (approvalModal.action === 'REJECT' && !comments.trim())}
                className={`flex-1 ${
                  approvalModal.action === 'APPROVE'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${approvalModal.action === 'APPROVE' ? 'Approve' : 'Reject'} Expense`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
