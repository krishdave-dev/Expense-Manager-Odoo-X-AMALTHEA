import { apiClient } from '@/lib/api-client';

export interface ExtractedExpenseData {
  amount: number | null;
  date: string | null;
  description: string | null;
  vendor: string | null;
  category: string | null;
  confidence: number;
}

export class OCRService {
  private static instance: OCRService;
  
  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async extractReceiptData(imageFile: File): Promise<ExtractedExpenseData> {
    try {
      console.log('Starting OCR processing for file:', imageFile.name, 'Size:', imageFile.size);
      
      // Use backend OCR processing with Tesseract.js
      const response = await apiClient.processReceiptOCR(imageFile);
      
      if (!response.success) {
        console.error('Backend OCR failed:', response.error);
        throw new Error(response.error || 'OCR processing failed on server');
      }

      console.log('OCR processing successful:', response.message);
      console.log('Extracted data:', response.data);

      // Transform backend response to match frontend expectations
      const backendData = response.data;
      const extractedData: ExtractedExpenseData = {
        amount: backendData.amount || null,
        date: backendData.date || null,
        description: backendData.description || null,
        vendor: backendData.vendor || null,
        category: backendData.category || null,
        confidence: backendData.confidence || 0,
      };

      // Log what was actually extracted
      console.log('Final extracted data for frontend:', extractedData);
      
      return extractedData;
    } catch (error: any) {
      console.error('OCR processing failed:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('Network')) {
        throw new Error('Network error during OCR processing. Please check your connection.');
      } else if (error.message?.includes('file')) {
        throw new Error('Invalid file type. Please upload an image (JPG, PNG) or PDF.');
      } else {
        throw new Error(`OCR processing failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

}