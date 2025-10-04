import Tesseract from 'tesseract.js';

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
      // Convert file to image URL for Tesseract
      const imageUrl = URL.createObjectURL(imageFile);
      
      // OCR processing with Tesseract.js
      const { data: { text, confidence } } = await Tesseract.recognize(
        imageUrl,
        'eng',
        {
          logger: m => console.log(m) // Optional: for debugging
        }
      );

      // Clean up the URL
      URL.revokeObjectURL(imageUrl);

      // Parse the extracted text
      const extractedData = this.parseReceiptText(text);
      extractedData.confidence = confidence;

      return extractedData;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to process receipt image');
    }
  }

  private parseReceiptText(text: string): ExtractedExpenseData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return {
      amount: this.extractAmount(text),
      date: this.extractDate(text),
      description: this.extractDescription(lines),
      vendor: this.extractVendor(lines),
      category: this.categorizeExpense(text),
      confidence: 0 // Will be set by the caller
    };
  }

  private extractAmount(text: string): number | null {
    // Patterns for different currency formats
    const patterns = [
      /(?:total|amount|sum|₹|rs\.?|inr)\s*:?\s*(\d+(?:\.\d{2})?)/i,
      /(\d+\.\d{2})\s*(?:₹|rs\.?|inr|total|amount)/i,
      /₹\s*(\d+(?:\.\d{2})?)/,
      /rs\.?\s*(\d+(?:\.\d{2})?)/i,
      /\b(\d+\.\d{2})\b(?=\s*(?:₹|rs|inr|total))/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1]);
        if (amount > 0 && amount < 1000000) { // Reasonable range
          return amount;
        }
      }
    }

    return null;
  }

  private extractDate(text: string): string | null {
    // Various date patterns
    const patterns = [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4})/i,
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4})/i,
      /((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{2,4})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        try {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          }
        } catch (error) {
          continue;
        }
      }
    }

    return null;
  }

  private extractVendor(lines: string[]): string | null {
    // Usually the vendor/restaurant name is in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Skip lines that look like addresses, phone numbers, or common receipt headers
      if (
        !line.match(/^\d+/) && // Not starting with number
        !line.match(/phone|tel|address|receipt|invoice/i) &&
        line.length > 3 && 
        line.length < 50
      ) {
        return line;
      }
    }
    return null;
  }

  private extractDescription(lines: string[]): string | null {
    // Look for item names or descriptions
    const itemLines = lines.filter(line => 
      line.length > 3 &&
      !line.match(/total|amount|tax|subtotal|₹|rs\.?/i) &&
      !line.match(/^\d+$/) &&
      !line.match(/phone|address|thank you/i)
    );

    if (itemLines.length > 0) {
      return itemLines.slice(0, 3).join(', '); // Take first 3 items
    }

    return null;
  }

  private categorizeExpense(text: string): string | null {
    const categories = {
      'Food': ['restaurant', 'cafe', 'food', 'dining', 'pizza', 'burger', 'coffee', 'meal'],
      'Travel': ['taxi', 'uber', 'ola', 'fuel', 'petrol', 'diesel', 'train', 'flight', 'hotel'],
      'Office': ['stationery', 'office', 'supplies', 'equipment', 'computer', 'software'],
      'Medical': ['hospital', 'pharmacy', 'medical', 'doctor', 'clinic', 'medicine'],
      'Entertainment': ['movie', 'cinema', 'entertainment', 'theater', 'game'],
      'Utilities': ['electricity', 'water', 'gas', 'internet', 'phone', 'mobile']
    };

    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }

    return 'Other';
  }
}