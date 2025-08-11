/**
 * Quote fetching hook and utilities
 */

import { supabase } from '@/lib/supabase';
import type { Quote } from '@/types/quote';

export async function fetchQuote(quoteId: string): Promise<Quote> {
  try {
    // Fetch quote data with related customer and items
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        id, number, date, currency, discount, tax_rate, notes,
        customer:customers ( name, email, phone, address ),
        items:quote_items ( description, qty, unit_price )
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError) {
      throw new Error(`Failed to fetch quote: ${quoteError.message}`);
    }

    if (!quoteData) {
      throw new Error('Quote not found');
    }

    // Fetch company profile
    const { data: companyData, error: companyError } = await supabase
      .from('company_profile')
      .select('name, address, logo_url')
      .single();

    if (companyError) {
      throw new Error(`Failed to fetch company profile: ${companyError.message}`);
    }

    // Transform the data to match our Quote type
    const quote: Quote = {
      id: quoteData.id,
      number: quoteData.number,
      date: quoteData.date,
      currency: quoteData.currency,
      discount: quoteData.discount || 0,
      tax_rate: quoteData.tax_rate || 18,
      notes: quoteData.notes,
      customer: {
        name: quoteData.customer?.name || 'Unknown Customer',
        email: quoteData.customer?.email,
        phone: quoteData.customer?.phone,
        address: quoteData.customer?.address,
      },
      items: quoteData.items || [],
      company: {
        name: companyData?.name || 'Your Company',
        address: companyData?.address,
        logo_url: companyData?.logo_url,
      },
    };

    return quote;
  } catch (error) {
    // DEV fallback - only in development mode
    if (import.meta.env.DEV) {
      console.warn('Using dev fallback data for quote:', quoteId);
      return {
        id: quoteId,
        number: 'DEMO-001',
        date: new Date().toISOString().split('T')[0],
        currency: 'TRY',
        discount: 0,
        tax_rate: 18,
        notes: 'This is demo data for development only',
        customer: {
          name: 'Demo Customer',
          email: 'demo@example.com',
          phone: '+90 555 123 4567',
          address: 'Demo Address, Istanbul, Turkey',
        },
        items: [
          { description: 'Demo Service 1', qty: 1, unit_price: 1000 },
          { description: 'Demo Service 2', qty: 2, unit_price: 500 },
        ],
        company: {
          name: 'Demo Company',
          address: 'Demo Company Address, Istanbul, Turkey',
          logo_url: null,
        },
      };
    }

    throw error;
  }
}