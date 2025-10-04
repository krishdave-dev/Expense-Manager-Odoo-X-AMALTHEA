"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Enhanced UI components with proper functionality
const Label = ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>
    {children}
  </label>
);

const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${className || ''}`}
    {...props}
  />
);

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

const Select = ({ value, onValueChange, children }: { value?: string; onValueChange?: (value: string) => void; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.select-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative select-container">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 hover:bg-gray-50 focus:border-purple-500 focus:ring-purple-500 ${className || ''}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext);
  return <span className={value ? 'text-gray-900' : 'text-gray-500'}>{value || placeholder}</span>;
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 z-50 w-full mt-1 rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
      <div className="p-1">
        {children}
      </div>
    </div>
  );
};

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext);

  return (
    <div
      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      onClick={() => {
        onValueChange?.(value);
        setIsOpen(false);
      }}
    >
      {children}
    </div>
  );
};
import { ArrowLeft, Save, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/lib/toast';

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Office',
  'Medical',
  'Entertainment',
  'Utilities',
  'Other'
];

export default function ExpenseFormPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, company } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    currency_code: company?.currency?.code || 'INR',
    date: '',
    description: '',
    category: '',
  });

  const loadDraftExpense = async (draftId: number) => {
    try {
      const drafts = await apiClient.getDraftExpenses();
      const draft = drafts.find(d => d.id === draftId);
      
      if (draft) {
        setEditingDraftId(draftId);
        setFormData({
          amount: draft.amount.toString(),
          currency_code: draft.currencyCode,
          date: new Date(draft.date).toISOString().split('T')[0],
          description: draft.description || '',
          category: draft.category || '',
        });
      }
    } catch (error) {
      console.error('Error loading draft expense:', error);
      toast.error('Failed to load draft expense');
    }
  };

  useEffect(() => {
    // Pre-fill form with OCR data from URL params
    const amount = searchParams.get('amount');
    const date = searchParams.get('date');
    const description = searchParams.get('description');
    const vendor = searchParams.get('vendor');
    const category = searchParams.get('category');
    const draftId = searchParams.get('draft');

    // If loading a draft, fetch it from API
    if (draftId) {
      loadDraftExpense(parseInt(draftId));
    } else {
      // Otherwise use OCR data from URL params
      setFormData(prev => ({
        ...prev,
        ...(amount && { amount }),
        ...(date && { date }),
        ...(description && { description: vendor ? `${vendor} - ${description}` : description }),
        ...(category && { category }),
      }));
    }
  }, [searchParams]);

  // Set today's date as default if no date is provided
  useEffect(() => {
    if (!formData.date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [formData.date]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        currency_code: formData.currency_code,
        category: formData.category || undefined,
        description: formData.description || undefined,
        date: formData.date,
      };

      if (editingDraftId) {
        // Update existing draft and submit it
        await apiClient.updateDraftExpense(editingDraftId, expenseData);
        await apiClient.submitDraftExpense(editingDraftId);
        toast.success('Draft expense updated and submitted successfully!');
      } else {
        // Create new expense
        await apiClient.createExpense(expenseData);
        toast.success('Expense submitted successfully!');
      }
      
      router.push('/user');
    } catch (error: any) {
      console.error('Error submitting expense:', error);
      toast.error(error.message || 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSavingDraft(true);

    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        currency_code: formData.currency_code,
        category: formData.category || undefined,
        description: formData.description || undefined,
        date: formData.date,
      };

      if (editingDraftId) {
        // Update existing draft
        await apiClient.updateDraftExpense(editingDraftId, expenseData);
        toast.success('Draft expense updated!');
      } else {
        // Create new draft
        await apiClient.createDraftExpense(expenseData);
        toast.success('Expense saved as draft!');
      }
      
      router.push('/user');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleBack = () => {
    router.push('/user');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2 hover:bg-gray-50 border-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Expenses
          </Button>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">
              {editingDraftId ? 'Edit Draft Expense' : 'Submit New Expense'}
            </CardTitle>
            <p className="text-purple-100 text-sm mt-1">
              Fill in the details below to submit your expense claim
            </p>
            {searchParams.get('amount') && (
              <div className="mt-2 text-xs text-purple-200 bg-purple-800 bg-opacity-50 px-2 py-1 rounded">
                💡 Form pre-filled with OCR data from receipt scan
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {/* Expense Preview */}
            {(formData.amount || formData.description) && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-800 mb-2">📋 Expense Preview</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {formData.amount && (
                    <div>
                      <span className="text-gray-600">Amount:</span>{' '}
                      <span className="font-medium text-purple-700">
                        {company?.currency?.symbol || '₹'}{formData.amount} {formData.currency_code}
                      </span>
                    </div>
                  )}
                  {formData.date && (
                    <div>
                      <span className="text-gray-600">Date:</span>{' '}
                      <span className="font-medium">{new Date(formData.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {formData.category && (
                    <div>
                      <span className="text-gray-600">Category:</span>{' '}
                      <span className="font-medium">{formData.category}</span>
                    </div>
                  )}
                  {formData.description && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Description:</span>{' '}
                      <span className="font-medium">{formData.description}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 flex items-center">
                💰 Amount *
              </Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className={`text-lg font-medium border-2 focus:ring-purple-500 ${errors.amount ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                    required
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>
                <div className="w-32">
                  <Select
                    value={formData.currency_code}
                    onValueChange={(value: string) => handleInputChange('currency_code', value)}
                  >
                    <SelectTrigger className="border-2 border-gray-300 focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">🇮🇳 INR</SelectItem>
                      <SelectItem value="USD">🇺🇸 USD</SelectItem>
                      <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                      <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm font-semibold text-gray-700 flex items-center">
                📅 Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`border-2 focus:ring-purple-500 ${errors.date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                required
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700 flex items-center">
                🏷️ Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) => handleInputChange('category', value)}
              >
                <SelectTrigger className="border-2 border-gray-300 focus:border-purple-500">
                  <SelectValue placeholder="Choose expense category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'Food' && '🍽️'} 
                      {category === 'Travel' && '✈️'} 
                      {category === 'Office' && '🏢'} 
                      {category === 'Medical' && '🏥'} 
                      {category === 'Entertainment' && '🎯'} 
                      {category === 'Utilities' && '⚡'} 
                      {category === 'Other' && '📦'} 
                      {' '}{category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center">
                📝 Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter details about your expense (e.g., business lunch with clients, office supplies purchase...)"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                rows={4}
                className="border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 text-base font-medium border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={isSavingDraft || isSubmitting}
                variant="outline"
                className="flex-1 h-12 text-base font-medium border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isSavingDraft}
                className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Submit Expense
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Tips for submitting expenses</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Include a clear description of what the expense was for</li>
              <li>• Make sure the date matches your receipt or payment</li>
              <li>• Select the most appropriate category for faster approval</li>
              <li>• Upload receipts using the "Scan Receipt" feature for auto-filling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}