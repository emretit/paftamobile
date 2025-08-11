import { pdf } from '@react-pdf/renderer';
import { supabase } from '@/integrations/supabase/client';
import { QuoteData, PdfTemplate, PdfExportOptions, TemplateSchema } from '@/types/pdf-template';
import PdfRenderer from '@/components/pdf/PdfRenderer';
import { createElement } from 'react';
import { validatePdfData } from '@/utils/pdfHelpers';

export class PdfExportService {
  /**
   * Get all PDF templates
   */
  static async getTemplates(type: 'quote' | 'invoice' | 'proposal' = 'quote') {
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('type', type)
      .order('is_default', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Şablonlar yüklenirken hata oluştu: ' + error.message);
    }

    return data as PdfTemplate[];
  }

  /**
   * Get default template for a type
   */
  static async getDefaultTemplate(type: 'quote' | 'invoice' | 'proposal' = 'quote') {
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('type', type)
      .eq('is_default', true)
      .single();

    if (error) {
      console.error('Error fetching default template:', error);
      throw new Error('Varsayılan şablon bulunamadı: ' + error.message);
    }

    return data as PdfTemplate;
  }

  /**
   * Get template by ID
   */
  static async getTemplate(id: string) {
    const { data, error } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      throw new Error('Şablon bulunamadı: ' + error.message);
    }

    return data as PdfTemplate;
  }

  /**
   * Save or update a template
   */
  static async saveTemplate(template: Omit<PdfTemplate, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pdf_templates')
      .upsert(template)
      .select()
      .single();

    if (error) {
      console.error('Error saving template:', error);
      throw new Error('Şablon kaydedilirken hata oluştu: ' + error.message);
    }

    return data as PdfTemplate;
  }

  /**
   * Set a template as default (unsets others)
   */
  static async setAsDefault(templateId: string, type: 'quote' | 'invoice' | 'proposal') {
    // First, unset all defaults for this type
    await supabase
      .from('pdf_templates')
      .update({ is_default: false })
      .eq('type', type);

    // Then set the selected template as default
    const { data, error } = await supabase
      .from('pdf_templates')
      .update({ is_default: true })
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      console.error('Error setting default template:', error);
      throw new Error('Varsayılan şablon ayarlanırken hata oluştu: ' + error.message);
    }

    return data as PdfTemplate;
  }

  /**
   * Generate PDF blob from quote data and template
   */
  static async generatePdf(quoteData: QuoteData, template?: PdfTemplate) {
    try {
      // Validate data before PDF generation
      const validation = validatePdfData(quoteData);
      if (!validation.isValid) {
        throw new Error(`PDF oluşturulamıyor. Eksik veriler: ${validation.missingFields.join(', ')}`);
      }

      // Get template if not provided
      let activeTemplate = template;
      if (!activeTemplate) {
        activeTemplate = await this.getDefaultTemplate('quote');
      }

      if (!activeTemplate) {
        throw new Error('Varsayılan şablon bulunamadı. Lütfen önce bir şablon oluşturun.');
      }

      // Create React element for PDF - temporarily disabled
      try {
        // const pdfElement = createElement(PdfRenderer, {
        //   data: quoteData,
        //   schema: activeTemplate.schema_json,
        // });

        // Generate PDF blob - returning mock blob for now
        const blob = new Blob(['PDF Generation temporarily disabled'], { type: 'application/pdf' });
        return blob;
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        throw new Error('PDF oluşturulamadı: ' + (pdfError as Error).message);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('PDF oluşturulurken hata oluştu: ' + (error as Error).message);
    }
  }

  /**
   * Download PDF file
   */
  static async downloadPdf(
    quoteData: QuoteData,
    options: PdfExportOptions = {}
  ) {
    try {
      const template = options.templateId 
        ? await this.getTemplate(options.templateId)
        : await this.getDefaultTemplate('quote');

      const blob = await this.generatePdf(quoteData, template);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = options.filename || `teklif-${quoteData.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  /**
   * Upload PDF to Supabase Storage
   */
  static async uploadPdfToStorage(
    quoteData: QuoteData,
    options: PdfExportOptions = {}
  ) {
    try {
      const template = options.templateId 
        ? await this.getTemplate(options.templateId)
        : await this.getDefaultTemplate('quote');

      const blob = await this.generatePdf(quoteData, template);
      
      // Generate file path
      const fileName = options.filename || `teklif-${quoteData.number}.pdf`;
      const storagePath = options.storagePath || `quotes/${fileName}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(storagePath, blob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (error) {
        console.error('Error uploading PDF:', error);
        throw new Error('PDF yüklenirken hata oluştu: ' + error.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);

      return { 
        success: true, 
        path: data.path,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error uploading PDF to storage:', error);
      throw error;
    }
  }

  /**
   * Transform proposal data to QuoteData format
   */
  static transformProposalToQuoteData(proposal: any, companySettings?: any): QuoteData {
    // Default company settings if not provided
    const defaultCompany = {
      name: companySettings?.company_name || 'Şirket Adı',
      address: companySettings?.address || '',
      phone: companySettings?.phone || '',
      email: companySettings?.email || '',
      tax_number: companySettings?.tax_number || '',
      tax_office: companySettings?.tax_office || '',
      logo_url: companySettings?.logo || null,
      website: companySettings?.website || ''
    };

    // Transform customer data
    const customer = {
      name: proposal.customer?.name || proposal.customer_name || 'Müşteri',
      company: proposal.customer?.company_name || '',
      email: proposal.customer?.email || '',
      mobile_phone: proposal.customer?.phone || '',
      office_phone: proposal.customer?.office_phone || '',
      address: proposal.customer?.address || '',
      tax_number: proposal.customer?.tax_number || '',
      tax_office: proposal.customer?.tax_office || ''
    };

    // Transform proposal lines
    const lines = (proposal.proposal_items || proposal.items || []).map((item: any) => ({
      id: item.id || '',
      description: item.product_name || item.description || '',
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
      unit: item.unit || '',
      tax_rate: Number(item.tax_rate || item.tax_percentage) || 18,
      discount_rate: Number(item.discount_percentage) || 0,
      total: Number(item.total_amount) || (Number(item.quantity) * Number(item.unit_price))
    }));

    return {
      id: proposal.id || '',
      number: proposal.proposal_number || proposal.number || '',
      title: proposal.title || '',
      description: proposal.description || '',
      customer,
      company: defaultCompany,
      items: lines,
      subtotal: Number(proposal.subtotal) || 0,
      total_discount: Number(proposal.total_discount) || 0,
      total_tax: Number(proposal.total_tax) || 0,
      total_amount: Number(proposal.total_amount) || 0,
      currency: proposal.currency || 'TRY',
      valid_until: proposal.valid_until || '',
      payment_terms: proposal.payment_terms || '',
      delivery_terms: proposal.delivery_terms || '',
      warranty_terms: proposal.warranty_terms || '',
      notes: proposal.notes || '',
      created_at: proposal.created_at || new Date().toISOString()
    };
  }

  /**
   * Get company settings for PDF header
   */
  static async getCompanySettings() {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error is ok
      console.error('Error fetching company settings:', error);
    }

    return data || {};
  }

}
