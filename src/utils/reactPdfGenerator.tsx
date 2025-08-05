import React from 'react';
import { pdf, Font } from '@react-pdf/renderer';
import { Proposal } from '@/types/proposal';
import { supabase } from '@/integrations/supabase/client';
import { CompanySettings } from '@/hooks/useCompanySettings';

// Register font for Turkish character support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

export class ReactPdfGenerator {
  async generateProposalPdf(proposal: Proposal, templateId?: string): Promise<void> {
    try {
      // Load company settings
      const companySettings = await this.loadCompanySettings();
      
      // Load the selected template component
      const { getPdfTemplate, getDefaultTemplate } = await import('./pdfTemplateRegistry');
      const selectedTemplate = templateId ? getPdfTemplate(templateId) : null;
      const templateConfig = selectedTemplate || getDefaultTemplate();
      
      // Generate PDF document with selected template
      const TemplateComponent = templateConfig.component;
      const doc = <TemplateComponent proposal={proposal} companySettings={companySettings} />;
      const pdfBlob = await pdf(doc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teklif-${proposal.number || 'yeni'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }

  private async loadCompanySettings(): Promise<CompanySettings> {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {
        id: 'default',
        company_name: 'Şirket Adı',
        address: 'Şirket Adresi',
        phone: 'Telefon',
        email: 'email@domain.com',
        tax_number: 'Vergi No',
        logo_url: '',
        default_currency: 'TRY',
        email_settings: { notifications_enabled: false }
      };
    } catch (error) {
      console.error('Error loading company settings:', error);
      return {
        id: 'default',
        company_name: 'Şirket Adı',
        address: 'Şirket Adresi',
        phone: 'Telefon',
        email: 'email@domain.com',
        tax_number: 'Vergi No',
        logo_url: '',
        default_currency: 'TRY',
        email_settings: { notifications_enabled: false }
      };
    }
  }
}

export const reactPdfGenerator = new ReactPdfGenerator();