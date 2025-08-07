import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Proposal } from '@/types/proposal';
import { supabase } from '@/integrations/supabase/client';
import { CompanySettings } from '@/hooks/useCompanySettings';

// React-PDF varsayılan font'ları kullanıyoruz (Helvetica, Times-Roman vb.)

export class ReactPdfGenerator {
  async generateProposalPdf(proposal: Proposal, templateId?: string): Promise<void> {
    try {
      // Load company settings
      const companySettings = await this.loadCompanySettings();
      
      let TemplateComponent;
      let templateConfig;
      
      if (templateId) {
        // Önce sabit template'lerde ara
        const { getPdfTemplate } = await import('./pdfTemplateRegistry');
        templateConfig = getPdfTemplate(templateId);
        
        if (templateConfig && templateConfig.component) {
          // Sabit template bulundu
          TemplateComponent = templateConfig.component;
        } else {
          // Dinamik template ara
          const dynamicTemplate = await this.loadDynamicTemplate(templateId);
          if (dynamicTemplate) {
            // Dinamik template bulundu - DynamicTemplate kullan
            const { DynamicTemplate } = await import('@/components/pdf-templates/DynamicTemplate');
            TemplateComponent = (props: any) => 
              <DynamicTemplate {...props} designSettings={dynamicTemplate.design_settings} />;
          } else {
            // Template bulunamadı - varsayılan kullan
            const { getDefaultTemplate } = await import('./pdfTemplateRegistry');
            templateConfig = getDefaultTemplate();
            TemplateComponent = templateConfig.component;
          }
        }
      } else {
        // Template ID yoksa varsayılan kullan
        const { getDefaultTemplate } = await import('./pdfTemplateRegistry');
        templateConfig = getDefaultTemplate();
        TemplateComponent = templateConfig.component;
      }
      
      // Generate PDF document with selected template
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

  private async loadDynamicTemplate(templateId: string): Promise<any> {
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
      console.warn('Could not load dynamic template:', error);
    }
    return null;
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