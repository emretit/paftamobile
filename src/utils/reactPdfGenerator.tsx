import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Proposal } from '@/types/proposal';
import { supabase } from '@/integrations/supabase/client';
import { CompanySettings } from '@/hooks/useCompanySettings';
import { TemplateDesignSettings } from '@/types/proposal-template';

// React-PDF varsayılan font'ları kullanıyoruz (Helvetica, Times-Roman vb.)

export class ReactPdfGenerator {
  async generatePdfPreviewWithDesign(design: TemplateDesignSettings): Promise<void> {
    // Örnek/rasgele verilerle PDF oluşturur (şablon denemesi)
    const mockProposal: any = {
      number: 'PREV-TEST-001',
      created_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      status: 'draft',
      currency: 'TRY',
      customer: { name: 'Örnek Müşteri A.Ş.', contact: 'Ahmet Yılmaz', title: 'Satın Alma' },
      items: [
        { name: 'Ürün 1', description: 'Açıklama', quantity: 2, unit: 'Adet', unit_price: 1500, total_price: 3000 },
        { name: 'Hizmet 1', description: 'Kurulum', quantity: 1, unit: 'Paket', unit_price: 2500, total_price: 2500 },
      ],
    };

    const companySettings = await this.loadCompanySettings();
    const { DynamicTemplate } = await import('@/components/pdf-templates/DynamicTemplate');
    const doc = <DynamicTemplate proposal={mockProposal} companySettings={companySettings} designSettings={design} />;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sablon-onizleme.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
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
        // Template ID yoksa önce aktif dinamik şablonu dene, yoksa varsayılanı kullan
        const activeDynamic = await this.loadActiveDynamicTemplate();
        if (activeDynamic) {
          const { DynamicTemplate } = await import('@/components/pdf-templates/DynamicTemplate');
          TemplateComponent = (props: any) => (
            <DynamicTemplate {...props} designSettings={activeDynamic.design_settings} />
          );
        } else {
          const { getDefaultTemplate } = await import('./pdfTemplateRegistry');
          templateConfig = getDefaultTemplate();
          TemplateComponent = templateConfig.component;
        }
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

  private async loadActiveDynamicTemplate(): Promise<any> {
    try {
      const { data: active, error: activeError } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!activeError && active) {
        return active;
      }
    } catch (e) {
      // ignore and fallback to latest
    }

    try {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        return data;
      }
    } catch (e) {
      // no-op
    }
    return null;
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
        tax_office: '',
        website: '',
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
        tax_office: '',
        website: '',
        logo_url: '',
        default_currency: 'TRY',
        email_settings: { notifications_enabled: false }
      };
    }
  }
}

export const reactPdfGenerator = new ReactPdfGenerator();