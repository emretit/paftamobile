/**
 * Export Service
 * 
 * Handles PDF export functionality with data fetching and generation
 */

import { supabase } from '../../lib/supabaseClient';
import { importPdfme } from '../../lib/pdf/pdfmeUtils';
import { applyMapping } from './buildInputs';
import type { FieldMapping, ExportData } from '../../lib/pdf/types';

export class ExportService {
  /**
   * Export PDF with template and field mapping
   */
  static async exportPdf(
    templateId: string,
    dataId: string,
    dataType: 'offer' | 'quotation' = 'offer'
  ): Promise<void> {
    try {
      // Fetch template and mapping
      const { data: template, error: templateError } = await supabase
        .from('pdf_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;
      if (!template) throw new Error('Template not found');

      // Fetch offer/quotation data
      const offerData = await this.fetchOfferData(dataId, dataType);
      
      // Apply field mapping to transform data
      const inputs = applyMapping(offerData, template.field_mapping_json);

      // Generate PDF
      const pdf = await this.generatePdf(template.template_json, inputs);

      // Open in new tab
      this.openPdfInNewTab(pdf, `${dataType}-${dataId}.pdf`);

    } catch (error: any) {
      console.error('Export error:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Fetch offer data with related information
   */
  private static async fetchOfferData(
    dataId: string,
    dataType: 'offer' | 'quotation'
  ): Promise<ExportData> {
    // For now, return mock data - replace with actual Supabase queries
    const mockData: ExportData = {
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        company: 'Acme Corporation',
        address: '123 Main St, City, State 12345'
      },
      offers: {
        id: dataId,
        number: 'OFF-2024-001',
        title: 'Web Development Services',
        date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: 5000,
        tax: 900,
        total: 5900,
        currency: 'USD',
        notes: 'Thank you for your business!'
      },
      items: [
        {
          name: 'Frontend Development',
          description: 'React application development',
          quantity: 1,
          price: 3000,
          total: 3000
        },
        {
          name: 'Backend Development',
          description: 'API and database setup',
          quantity: 1,
          price: 2000,
          total: 2000
        }
      ],
      company: {
        name: 'Your Company Name',
        address: '456 Business Ave, City, State 67890',
        phone: '+1 (555) 987-6543',
        email: 'info@company.com',
        logo: 'https://via.placeholder.com/200x100?text=Logo'
      }
    };

    return mockData;
  }

  /**
   * Generate PDF using pdfme
   */
  private static async generatePdf(
    template: any,
    inputs: Record<string, any>
  ): Promise<Uint8Array> {
    const { generate, plugins, BLANK_PDF } = await importPdfme();

    // Prepare template
    const preparedTemplate = JSON.parse(JSON.stringify(template));
    if (preparedTemplate.basePdf === 'BLANK_PDF') {
      preparedTemplate.basePdf = BLANK_PDF;
    }

    // Generate PDF
    const pdf = await generate({
      template: preparedTemplate,
      inputs: [inputs],
      plugins,
    });

    return pdf;
  }

  /**
   * Open PDF in new tab
   */
  private static openPdfInNewTab(pdf: Uint8Array, filename: string): void {
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      // Fallback to download if popup blocked
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  /**
   * Preview PDF with sample data
   */
  static async previewPdf(
    template: any,
    mapping: FieldMapping
  ): Promise<void> {
    try {
      // Use sample data for preview
      const sampleData: ExportData = {
        customer: {
          name: 'Sample Customer',
          email: 'customer@example.com',
          phone: '+1 (555) 123-4567',
          company: 'Sample Company',
          address: '123 Sample St, City, State 12345'
        },
        offers: {
          id: 'SAMPLE-001',
          number: 'OFF-2024-SAMPLE',
          title: 'Sample Offer',
          date: new Date().toISOString(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subtotal: 1000,
          tax: 180,
          total: 1180,
          currency: 'USD',
          notes: 'This is a sample offer for preview purposes.'
        },
        items: [
          {
            name: 'Sample Product',
            description: 'Sample product description',
            quantity: 2,
            price: 500,
            total: 1000
          }
        ],
        company: {
          name: 'Your Company',
          address: '456 Business Ave, City, State 67890',
          phone: '+1 (555) 987-6543',
          email: 'info@company.com',
          logo: 'https://via.placeholder.com/200x100?text=Logo'
        }
      };

      // Apply mapping and generate PDF
      const inputs = applyMapping(sampleData, mapping);
      const pdf = await this.generatePdf(template, inputs);
      
      this.openPdfInNewTab(pdf, 'preview.pdf');

    } catch (error: any) {
      console.error('Preview error:', error);
      throw new Error(`Preview failed: ${error.message}`);
    }
  }
}