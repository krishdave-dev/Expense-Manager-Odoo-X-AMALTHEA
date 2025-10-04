"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ExpenseFormPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    description: '',
    vendor: '',
    category: '',
    // ...other fields
  });

  useEffect(() => {
    // Pre-fill form with OCR data from URL params
    const amount = searchParams.get('amount');
    const date = searchParams.get('date');
    const description = searchParams.get('description');
    const vendor = searchParams.get('vendor');
    const category = searchParams.get('category');

    setFormData(prev => ({
      ...prev,
      ...(amount && { amount }),
      ...(date && { date }),
      ...(description && { description }),
      ...(vendor && { vendor }),
      ...(category && { category }),
    }));
  }, [searchParams]);

  // ...rest of the component
}