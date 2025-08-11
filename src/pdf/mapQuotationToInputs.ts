/**
 * Quotation to PDF Inputs Mapper
 * 
 * Converts quotation data to pdfme template inputs with proper formatting.
 * Handles currency formatting, date formatting, and table data structuring.
 */

import { Quotation } from '@/hooks/useQuotation';

export interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const mapQuotationToInputs = (
  quotation: Quotation,
  companyInfo?: CompanyInfo
) => {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Generate quote number if not exists
  const quoteNumber = quotation.meta?.quoteNumber || 
    `Q-${new Date(quotation.created_at).getFullYear()}-${quotation.id.slice(-6).toUpperCase()}`;

  // Calculate valid until date (30 days from creation)
  const validUntilDate = new Date(quotation.created_at);
  validUntilDate.setDate(validUntilDate.getDate() + 30);

  // Prepare items table data
  const tableData = quotation.items.map(item => [
    item.name + (item.description ? `\n${item.description}` : ''),
    item.quantity.toString(),
    formatCurrency(item.price, quotation.currency),
    formatCurrency(item.total, quotation.currency)
  ]);

  return {
    // Company information
    companyName: companyInfo?.name || 'Your Company Name',
    companyAddress: companyInfo?.address || '',
    companyPhone: companyInfo?.phone || '',
    companyEmail: companyInfo?.email || '',

    // Quote information
    quoteNumber: `Quote #${quoteNumber}`,
    quoteDate: `Date: ${formatDate(quotation.created_at)}`,
    validUntil: `Valid Until: ${formatDate(validUntilDate)}`,

    // Customer information
    customerName: quotation.customer_name || 'Customer Name',
    customerCompany: quotation.customer_company || '',
    customerEmail: quotation.customer_email || '',

    // Items table
    itemsTable: tableData,

    // Financial totals
    subtotalAmount: formatCurrency(quotation.subtotal, quotation.currency),
    taxAmount: formatCurrency(quotation.tax, quotation.currency),
    totalAmount: formatCurrency(quotation.total, quotation.currency),

    // Additional metadata
    currency: quotation.currency,
    notes: quotation.meta?.notes || '',
    terms: quotation.meta?.terms || 
      'Terms and Conditions:\n\nPayment is due within 30 days of invoice date.\nLate payments may be subject to fees.\nGoods remain the property of the seller until payment is received in full.',
  };
};

// Mock quotation for testing/preview
export const createMockQuotation = (): Quotation => ({
  id: 'mock-quote-123',
  project_id: 'project-123',
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_company: 'Acme Corporation',
  items: [
    {
      id: '1',
      name: 'Web Development Services',
      description: 'Custom website development with React and TypeScript',
      quantity: 1,
      price: 5000,
      total: 5000
    },
    {
      id: '2',
      name: 'Logo Design',
      description: 'Professional logo design package',
      quantity: 1,
      price: 500,
      total: 500
    },
    {
      id: '3',
      name: 'SEO Optimization',
      description: 'Search engine optimization for 6 months',
      quantity: 6,
      price: 200,
      total: 1200
    }
  ],
  subtotal: 6700,
  tax: 1206,
  total: 7906,
  currency: 'USD',
  meta: {
    quoteNumber: 'Q-2024-001',
    notes: 'Thank you for choosing our services!'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});