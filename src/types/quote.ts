/**
 * Quote Types for React-PDF Export System
 */

export type QuoteItem = {
  description: string;
  qty: number;
  unit_price: number;
};

export type Quote = {
  id: string;
  number: string;
  date: string;
  currency: string;
  discount: number;
  tax_rate: number;
  notes?: string | null;
  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  items: QuoteItem[];
  company: {
    name: string;
    address?: string | null;
    logo_url?: string | null;
  };
};