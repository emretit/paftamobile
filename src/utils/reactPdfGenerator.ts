import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { StandardTemplate } from '@/components/pdf-templates/StandardTemplate';
import { ModernTemplate } from '@/components/pdf-templates/ModernTemplate';
import { MinimalTemplate } from '@/components/pdf-templates/MinimalTemplate';
import { Proposal } from '@/types/proposal';
import { supabase } from '@/integrations/supabase/client';

interface CompanyInfo {
  company_name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_number?: string;
  logo_url?: string;
  id?: string;
  default_currency?: string;
  email_settings?: any;
}

export class ReactPdfGenerator {
  private companyInfo?: CompanyInfo;

  constructor() {}

  async generateProposalPdf(proposal: Proposal, templateId?: string): Promise<void> {
    console.log('React PDF Generation started', { proposalId: proposal.id, templateId });
    
    // Fetch company settings
    await this.loadCompanySettings();
    console.log('Company settings loaded:', this.companyInfo);
    
    // Select template based on templateId or use default
    let TemplateComponent = StandardTemplate;
    
    let designSettings = undefined;
    if (templateId) {
      // Load template from database and determine which React component to use
      const template = await this.loadTemplate(templateId);
      designSettings = template?.design_settings;
      
      if (template?.template_type === 'modern') {
        TemplateComponent = ModernTemplate;
      } else if (template?.template_type === 'minimal') {
        TemplateComponent = MinimalTemplate;
      }
      // Default stays StandardTemplate
    }

    try {
      // Generate PDF using React-PDF
      const templateProps = { 
        proposal, 
        companySettings: this.companyInfo || {
          company_name: 'Şirket Adı',
          address: '',
          phone: '',
          email: '',
          tax_number: '',
          logo_url: ''
        },
        designSettings
      };

      const pdfDocument = pdf(
        React.createElement(TemplateComponent, templateProps) as any
      );

      // Create blob and open in new tab for printing
      const pdfBlob = await pdfDocument.toBlob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      console.log('React PDF generated successfully');
    } catch (error) {
      console.error('React PDF generation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        proposal: proposal,
        companyInfo: this.companyInfo,
        designSettings: designSettings
      });
      
      // Fallback to jsPDF generator
      console.warn('Falling back to jsPDF generator');
      try {
        const { ProposalPdfGenerator } = await import('./proposalPdfGenerator');
        const fallbackGenerator = new ProposalPdfGenerator();
        await fallbackGenerator.generateProposalPdf(proposal, templateId);
        console.log('Fallback PDF generation successful');
      } catch (fallbackError) {
        console.error('Fallback PDF generation also failed:', fallbackError);
        alert(`PDF oluşturulamadı: ${error.message}`);
        throw error;
      }
    }
  }

  private async loadCompanySettings(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .maybeSingle();
      
      if (!error && data) {
        this.companyInfo = {
          company_name: data.company_name || 'Şirket Adı',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          tax_number: data.tax_number || '',
          logo_url: data.logo_url || ''
        };
      }
    } catch (error) {
      console.warn('Could not load company settings:', error);
    }
  }

  private async loadTemplate(templateId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.warn('Could not load template:', error);
    }
    return null;
  }
}

// Export an instance for easy importing
export const reactPdfGenerator = new ReactPdfGenerator();