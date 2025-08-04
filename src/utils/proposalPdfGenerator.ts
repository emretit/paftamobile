import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Proposal } from '@/types/proposal';
import { ProposalTemplate, TemplateDesignSettings } from '@/types/proposal-template';
import { formatCurrency } from '@/utils/formatters';
import { supabase } from '@/integrations/supabase/client';

interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  logo?: string;
}

export class ProposalPdfGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private marginLeft = 20;
  private marginRight = 20;
  private contentWidth: number;
  private designSettings?: TemplateDesignSettings;
  private companyInfo?: CompanyInfo;

  constructor(designSettings?: TemplateDesignSettings) {
    this.designSettings = designSettings || this.getDefaultDesignSettings();
    
    this.pdf = new jsPDF({
      orientation: this.designSettings.orientation,
      unit: 'mm',
      format: this.designSettings.pageSize.toLowerCase() as any
    });
    
    this.pageWidth = this.designSettings.pageSize === 'A4' ? 210 : 
                     this.designSettings.pageSize === 'Letter' ? 216 : 297;
    this.marginLeft = this.designSettings.margins.left;
    this.marginRight = this.designSettings.margins.right;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
  }

  async generateProposalPdf(proposal: Proposal, templateId?: string): Promise<void> {
    // Fetch company settings
    await this.loadCompanySettings();
    
    // Load template if specified
    if (templateId && templateId !== 'default') {
      await this.loadTemplate(templateId);
    } else {
      // Default template kullanılıyorsa explicit olarak default ayarları set et
      this.designSettings = this.getDefaultDesignSettings();
    }
    
    // Set primary font
    this.pdf.setFont(this.designSettings?.fonts.primary || 'helvetica');
    
    // Render sections based on template settings
    let currentY = this.designSettings?.margins.top || 20;
    
    const enabledSections = this.designSettings?.sections
      .filter(section => section.enabled)
      .sort((a, b) => a.order - b.order) || [];
    
    for (const section of enabledSections) {
      switch (section.type) {
        case 'header':
          currentY = this.addTemplateHeader(proposal, currentY);
          break;
        case 'proposal-info':
          currentY = this.addProposalInfo(proposal, currentY);
          break;
        case 'customer-info':
          currentY = this.addCustomerInfo(proposal, currentY);
          break;
        case 'items-table':
          currentY = this.addItemsTable(proposal, currentY);
          break;
        case 'totals':
          currentY = this.addTotals(proposal, currentY);
          break;
        case 'terms':
          currentY = this.addTerms(proposal, currentY);
          break;
        case 'footer':
          this.addTemplateFooter(proposal, currentY);
          break;
      }
      currentY += 10; // Add spacing between sections
    }

    // PDF'yi yeni sekmede aç ve yazdır
    const pdfBlob = this.pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
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
          name: data.company_name || 'Şirket Adı',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          taxNumber: data.tax_number || '',
          logo: data.logo_url || ''
        };
      }
    } catch (error) {
      console.warn('Could not load company settings:', error);
    }
  }

  private async loadTemplate(templateId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (!error && data) {
        if (data.design_settings) {
          this.designSettings = data.design_settings as TemplateDesignSettings;
        } else {
          // Şablon var ama design_settings null ise default ayarları kullan
          console.warn(`Template ${templateId} has no design_settings, using defaults`);
          this.designSettings = this.getDefaultDesignSettings();
        }
      }
    } catch (error) {
      console.warn('Could not load template:', error);
      // Template yüklenemezse default ayarları kullan
      this.designSettings = this.getDefaultDesignSettings();
    }
  }

  private addTemplateHeader(proposal: Proposal, startY: number): number {
    const headerSettings = this.designSettings?.header;
    const colors = this.designSettings?.colors;
    const fonts = this.designSettings?.fonts;
    let currentY = startY;

    if (!headerSettings?.enabled) return currentY;

    // Set background color if specified
    if (headerSettings.backgroundColor && headerSettings.backgroundColor !== 'transparent') {
      this.pdf.setFillColor(headerSettings.backgroundColor);
      this.pdf.rect(0, currentY - 5, this.pageWidth, headerSettings.height || 40, 'F');
    }

    // Set text color - convert hex to RGB for jsPDF
    const textColor = headerSettings.textColor || colors?.text || '#000000';
    const [r, g, b] = this.hexToRgb(textColor);
    this.pdf.setTextColor(r, g, b);

    // Company logo and info (left side)
    let leftY = currentY + 10;
    this.pdf.setFontSize(fonts?.sizes.heading || 16);
    this.pdf.setFont(fonts?.primary || 'helvetica', 'bold');
    
    const companyName = this.companyInfo?.name || this.designSettings?.branding?.companyName || 'My Company';
    this.pdf.text(companyName, this.marginLeft, leftY);
    
    if (headerSettings.showCompanyInfo && this.companyInfo) {
      leftY += 8;
      this.pdf.setFontSize(fonts?.sizes.small || 10);
      this.pdf.setFont(fonts?.primary || 'helvetica', 'normal');
      
      if (this.companyInfo.address) {
        this.pdf.text(this.companyInfo.address, this.marginLeft, leftY);
        leftY += 5;
      }
      if (this.companyInfo.phone) {
        this.pdf.text(`Tel: ${this.companyInfo.phone}`, this.marginLeft, leftY);
        leftY += 5;
      }
      if (this.companyInfo.email) {
        this.pdf.text(`E-posta: ${this.companyInfo.email}`, this.marginLeft, leftY);
        leftY += 5;
      }
      if (this.companyInfo.taxNumber) {
        this.pdf.text(`Vergi No: ${this.companyInfo.taxNumber}`, this.marginLeft, leftY);
        leftY += 5;
      }
    }

    // Proposal title (right side)
    this.pdf.setFontSize(fonts?.sizes.title || 24);
    this.pdf.setFont(fonts?.primary || 'helvetica', 'bold');
    const primaryColor = colors?.primary || '#000000';
    const [pr, pg, pb] = this.hexToRgb(primaryColor);
    this.pdf.setTextColor(pr, pg, pb);
    this.pdf.text('TEKLİF', this.pageWidth - this.marginRight, currentY + 20, { align: 'right' });

    return Math.max(leftY + 10, currentY + (headerSettings.height || 40) + 10);
  }

  private addProposalInfo(proposal: Proposal, startY: number): number {
    let currentY = startY;

    // Teklif bilgileri tablosu
    const proposalData = [
      ['Teklif No:', proposal.number || ''],
      ['Teklif Tarihi:', proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : ''],
      ['Geçerlilik Tarihi:', proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : ''],
      ['Durum:', this.getStatusLabel(proposal.status)]
    ];

    // @ts-ignore
    this.pdf.autoTable({
      startY: currentY,
      body: proposalData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 2
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 60 }
      },
      margin: { left: this.pageWidth - 120, right: this.marginRight }
    });

    return (this.pdf as any).lastAutoTable.finalY + 15;
  }

  private addCustomerInfo(proposal: Proposal, startY: number): number {
    if (!proposal.customer) return startY;

    let currentY = startY;

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('MÜŞTERİ BİLGİLERİ', this.marginLeft, currentY);
    
    currentY += 8;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    if (proposal.customer.name) {
      this.pdf.text(`Firma: ${proposal.customer.name}`, this.marginLeft, currentY);
      currentY += 5;
    }
    if (proposal.customer.company) {
      this.pdf.text(`Şirket: ${proposal.customer.company}`, this.marginLeft, currentY);
      currentY += 5;
    }
    if (proposal.customer.email) {
      this.pdf.text(`E-posta: ${proposal.customer.email}`, this.marginLeft, currentY);
      currentY += 5;
    }
    if (proposal.customer.phone) {
      this.pdf.text(`Telefon: ${proposal.customer.phone}`, this.marginLeft, currentY);
      currentY += 5;
    }
    if (proposal.customer.address) {
      this.pdf.text(`Adres: ${proposal.customer.address}`, this.marginLeft, currentY);
      currentY += 5;
    }

    return currentY + 10;
  }

  private addItemsTable(proposal: Proposal, startY: number): number {
    if (!proposal.items || proposal.items.length === 0) {
      return startY;
    }

    const colors = this.designSettings?.colors;
    const fonts = this.designSettings?.fonts;
    const tableSettings = this.designSettings?.table;

    this.pdf.setFontSize(fonts?.sizes.heading || 12);
    this.pdf.setFont(fonts?.primary || 'helvetica', 'bold');
    const sectionTextColor = colors?.text || '#000000';
    const [st_r, st_g, st_b] = this.hexToRgb(sectionTextColor);
    this.pdf.setTextColor(st_r, st_g, st_b);
    this.pdf.text('TEKLİF KALEMLERI', this.marginLeft, startY);

    const tableData = proposal.items.map((item, index) => [
      (index + 1).toString(),
      item.name || '',
      item.description || '',
      item.quantity?.toString() || '1',
      item.unit || 'Adet',
      formatCurrency(item.unit_price || 0),
      formatCurrency((item.quantity || 1) * (item.unit_price || 0))
    ]);

    // Use class method for hex to RGB conversion

    const headerBgColor = tableSettings?.headerBackground ? 
      this.hexToRgb(tableSettings.headerBackground) : [71, 85, 105];
    const headerTextColor = tableSettings?.headerText ? 
      this.hexToRgb(tableSettings.headerText) : [255, 255, 255];

    // @ts-ignore
    this.pdf.autoTable({
      startY: startY + 8,
      head: [['#', 'Ürün/Hizmet', 'Açıklama', 'Miktar', 'Birim', 'Birim Fiyat', 'Toplam']],
      body: tableData,
      theme: tableSettings?.rowAlternating ? 'striped' : 'plain',
      headStyles: {
        fillColor: headerBgColor,
        textColor: headerTextColor,
        fontSize: fonts?.sizes.small || 9,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: fonts?.sizes.small || 8,
        cellPadding: 3,
        lineColor: tableSettings?.borderColor ? this.hexToRgb(tableSettings.borderColor) : [200, 200, 200],
        lineWidth: tableSettings?.borderWidth || 0.1
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: this.marginLeft, right: this.marginRight }
    });

    return (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addTotals(proposal: Proposal, startY: number): number {
    const subtotal = proposal.items?.reduce((sum, item) => 
      sum + ((item.quantity || 1) * (item.unit_price || 0)), 0) || 0;
    
    const taxRate = 0.20; // %20 KDV
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const totalsData = [
      ['Ara Toplam:', formatCurrency(subtotal)],
      ['KDV (%20):', formatCurrency(taxAmount)],
      ['GENEL TOPLAM:', formatCurrency(total)]
    ];

    // @ts-ignore
    this.pdf.autoTable({
      startY: startY,
      body: totalsData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40, halign: 'right' },
        1: { fontStyle: 'bold', cellWidth: 30, halign: 'right' }
      },
      margin: { left: this.pageWidth - 90, right: this.marginRight }
    });

    return (this.pdf as any).lastAutoTable.finalY + 15;
  }

  private addTerms(proposal: Proposal, startY: number): number {
    let currentY = startY;
    const fonts = this.designSettings?.fonts;
    const colors = this.designSettings?.colors;

    // Ödeme şartları
    if (proposal.payment_terms) {
      this.pdf.setFontSize(fonts?.sizes.body || 10);
      this.pdf.setFont(fonts?.primary || 'helvetica', 'bold');
      this.pdf.setTextColor(colors?.text || '#000000');
      this.pdf.text('ÖDEME ŞARTLARI:', this.marginLeft, currentY);
      currentY += 6;
      
      this.pdf.setFont(fonts?.primary || 'helvetica', 'normal');
      const paymentTermsLines = this.pdf.splitTextToSize(proposal.payment_terms, this.contentWidth);
      this.pdf.text(paymentTermsLines, this.marginLeft, currentY);
      currentY += paymentTermsLines.length * 5 + 5;
    }

    // Teslimat şartları
    if (proposal.delivery_terms) {
      this.pdf.setFontSize(fonts?.sizes.body || 10);
      this.pdf.setFont(fonts?.primary || 'helvetica', 'bold');
      this.pdf.text('TESLİMAT ŞARTLARI:', this.marginLeft, currentY);
      currentY += 6;
      
      this.pdf.setFont(fonts?.primary || 'helvetica', 'normal');
      const deliveryTermsLines = this.pdf.splitTextToSize(proposal.delivery_terms, this.contentWidth);
      this.pdf.text(deliveryTermsLines, this.marginLeft, currentY);
      currentY += deliveryTermsLines.length * 5 + 5;
    }

    // Notlar
    if (proposal.notes) {
      this.pdf.setFontSize(fonts?.sizes.body || 10);
      this.pdf.setFont(fonts?.primary || 'helvetica', 'bold');
      this.pdf.text('NOTLAR:', this.marginLeft, currentY);
      currentY += 6;
      
      this.pdf.setFont(fonts?.primary || 'helvetica', 'normal');
      const notesLines = this.pdf.splitTextToSize(proposal.notes, this.contentWidth);
      this.pdf.text(notesLines, this.marginLeft, currentY);
      currentY += notesLines.length * 5 + 10;
    }

    return currentY;
  }

  private addTemplateFooter(proposal: Proposal, startY: number): void {
    const footerSettings = this.designSettings?.footer;
    const colors = this.designSettings?.colors;
    const fonts = this.designSettings?.fonts;

    if (!footerSettings?.enabled) return;

    const footerY = this.pdf.internal.pageSize.height - (this.designSettings?.margins.bottom || 20);
    
    // Set background color if specified
    if (footerSettings.backgroundColor && footerSettings.backgroundColor !== 'transparent') {
      this.pdf.setFillColor(footerSettings.backgroundColor);
      this.pdf.rect(0, footerY - 5, this.pageWidth, footerSettings.height || 20, 'F');
    }

    this.pdf.setFontSize(fonts?.sizes.small || 8);
    this.pdf.setTextColor(footerSettings.textColor || colors?.text || '#888888');
    
    let footerText = 'Bu teklif elektronik ortamda oluşturulmuş olup imza gerektirmez.';
    
    if (footerSettings.showContactInfo && this.companyInfo) {
      footerText += ` • ${this.companyInfo.name}`;
      if (this.companyInfo.phone) {
        footerText += ` • Tel: ${this.companyInfo.phone}`;
      }
      if (this.companyInfo.email) {
        footerText += ` • ${this.companyInfo.email}`;
      }
    }

    this.pdf.text(footerText, this.pageWidth / 2, footerY, { align: 'center' });

    // Page numbers if enabled
    if (footerSettings.showPageNumbers) {
      this.pdf.text(
        `Sayfa 1`,
        this.pageWidth - this.marginRight,
        footerY,
        { align: 'right' }
      );
    }
  }

  private getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      draft: 'Taslak',
      sent: 'Gönderildi',
      accepted: 'Kabul Edildi',
      rejected: 'Reddedildi',
      expired: 'Süresi Doldu',
      pending_approval: 'Onay Bekliyor'
    };
    return statusLabels[status] || status;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [71, 85, 105];
  }

  private getDefaultDesignSettings(): TemplateDesignSettings {
    return {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 20, bottom: 20, left: 20, right: 20 },
      header: {
        enabled: true,
        height: 60,
        logoPosition: 'left',
        logoSize: 'medium',
        showCompanyInfo: true,
        backgroundColor: 'transparent',
        textColor: '#000000'
      },
      footer: {
        enabled: true,
        height: 20,
        showPageNumbers: false,
        showContactInfo: false,
        backgroundColor: 'transparent',
        textColor: '#888888'
      },
      colors: {
        primary: '#0f172a',
        secondary: '#64748b',
        accent: '#3b82f6',
        text: '#000000',
        background: '#ffffff',
        border: '#e2e8f0'
      },
      fonts: {
        primary: 'helvetica',
        secondary: 'helvetica',
        sizes: { title: 24, heading: 12, body: 10, small: 8 }
      },
      table: {
        headerBackground: '#475569',
        headerText: '#ffffff',
        rowAlternating: true,
        borderColor: '#e2e8f0',
        borderWidth: 0.1
      },
      layout: {
        spacing: 'normal',
        showBorders: false,
        roundedCorners: false,
        shadowEnabled: false
      },
      branding: {
        companyName: 'Şirket Adı',
        tagline: '',
        website: ''
      },
      sections: [
        { id: '1', type: 'header', title: 'Başlık', enabled: true, order: 1, settings: {} },
        { id: '2', type: 'proposal-info', title: 'Teklif Bilgileri', enabled: true, order: 2, settings: {} },
        { id: '3', type: 'customer-info', title: 'Müşteri Bilgileri', enabled: true, order: 3, settings: {} },
        { id: '4', type: 'items-table', title: 'Ürün/Hizmet Tablosu', enabled: true, order: 4, settings: {} },
        { id: '5', type: 'totals', title: 'Toplam', enabled: true, order: 5, settings: {} },
        { id: '6', type: 'terms', title: 'Şartlar', enabled: true, order: 6, settings: {} },
        { id: '7', type: 'footer', title: 'Alt Bilgi', enabled: true, order: 7, settings: {} }
      ]
    };
  }
}