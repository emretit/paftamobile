import { Proposal } from '@/types/proposal';

export class PDFMeGenerator {
  async generateProposalPDF(proposal: Proposal, template: any): Promise<void> {
    try {
      // Dynamically import PDFMe to avoid SSR issues
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes, table } = await import('@pdfme/schemas');
      
      // Map proposal data to template inputs
      const inputs = this.mapProposalToInputs(proposal, template);
      
      // Generate PDF with type assertion for plugins
      const pdf = await generate({
        template,
        inputs: [inputs],
        plugins: { text, image, qrcode: barcodes.qrcode, table } as any
      });

      // Download the PDF
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teklif-${proposal.proposal_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('PDF oluşturulamadı');
    }
  }

  async generatePreviewPDF(template: any, mockData?: Record<string, any>): Promise<void> {
    try {
      // Dynamically import PDFMe to avoid SSR issues
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes, table } = await import('@pdfme/schemas');
      
      // Use mock data or default values
      const inputs = mockData || this.getMockData();
      
      const pdf = await generate({
        template,
        inputs: [inputs],
        plugins: { text, image, qrcode: barcodes.qrcode, table } as any
      });

      // Download preview
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sablon-onizleme.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Preview generation error:', error);
      throw new Error('Önizleme oluşturulamadı');
    }
  }

  private mapProposalToInputs(proposal: Proposal, template: any): Record<string, any> {
    const inputs: Record<string, any> = {};
    
    // Get schema fields from first schema
    const schema = template.schemas?.[0] || {};
    
    // Convert proposal items to table format and compute money fields
    const itemsArray = Array.isArray((proposal as any).items) ? (proposal as any).items : [];
    const proposalItems = this.convertItemsToTableData(itemsArray);
    const computedSubTotal = itemsArray.reduce((sum: number, it: any) => {
      const qty = Number(it?.quantity ?? 0) || 0;
      const unit = Number(it?.unit_price ?? 0) || 0;
      const total = Number(it?.total_price ?? qty * unit) || 0;
      return sum + total;
    }, 0);
    const discountAmount = Number((proposal as any)?.discount_amount ?? (proposal as any)?.discount ?? 0) || 0;
    const totalAmount = Number((proposal as any)?.total_amount ?? (computedSubTotal - discountAmount)) || 0;
    
    // Map common proposal fields
    const fieldMappings: Record<string, any> = {
      companyName: (proposal as any)?.company_name || 'Şirket Adı',
      companyLogo: (proposal as any)?.company_logo || '',
      companyAddress: (proposal as any)?.company_address || '',
      companyContact: (proposal as any)?.company_contact || '',
      proposalTitle: proposal.title || 'Teklif Başlığı',
      proposalNumber: proposal.proposal_number || 'TKL-001',
      customerName: proposal.customer_name || 'Müşteri Adı',
      customerAddress: (proposal as any)?.customer_address || '',
      customerTaxNo: (proposal as any)?.customer_tax_no || '',
      totalAmount: proposal.total_amount ? `${proposal.total_amount.toLocaleString('tr-TR')} ₺` : '0 ₺',
      createdDate: proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
      validUntil: proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : '',
      paymentTerms: proposal.payment_terms || 'Standart ödeme koşulları',
      notes: proposal.notes || '',
      // Table data for proposal items
      proposalItemsTable: proposalItems,
      // Totals
      subTotal: `${computedSubTotal.toLocaleString('tr-TR')} ₺`,
      discountAmount: `${discountAmount.toLocaleString('tr-TR')} ₺`,
      netTotal: `${totalAmount.toLocaleString('tr-TR')} ₺`,
      // Terms & Conditions
      termsText: (proposal as any)?.terms_text || 'Şartlar ve koşullar burada yer alacaktır.',
      // QR Code data
      proposalQRCode: `${proposal.proposal_number || 'TKL-001'} | ${proposal.customer_name || 'Müşteri'} | ${proposal.total_amount ? proposal.total_amount.toLocaleString('tr-TR') : '0'} ₺`,
      // Header/Footer data
      companyHeader: 'Şirket Adı',
      headerLine: ' ',
      pageNumber: 'Sayfa {currentPage}/{totalPages}',
      footerLine: ' ',
      currentDate: new Date().toLocaleDateString('tr-TR'),
      companyFooter: 'www.sirketadi.com | info@sirketadi.com',
      // Summary text data
      proposalSummary: `Teklif: ${proposal.proposal_number || 'TKL-001'} | Müşteri: ${proposal.customer_name || 'Müşteri'} | Toplam: ${proposal.total_amount ? proposal.total_amount.toLocaleString('tr-TR') : '0'} ₺`
    };

    // Map schema fields to proposal data
    Object.keys(schema).forEach(fieldKey => {
      if (fieldMappings[fieldKey] !== undefined) {
        inputs[fieldKey] = fieldMappings[fieldKey];
      } else {
        // Default empty value
        inputs[fieldKey] = '';
      }
    });

    return inputs;
  }

  private convertItemsToTableData(items: any[]): string[][] {
    if (!items || items.length === 0) {
      return [['Ürün/Hizmet bulunamadı', '-', '-', '-', '-']];
    }

    return items.map(item => [
      item.name || 'Ürün',
      (item.quantity || 0).toString(),
      item.unit || 'Adet',
      item.unit_price ? `${item.unit_price.toLocaleString('tr-TR')} ₺` : '0 ₺',
      item.total_price ? `${item.total_price.toLocaleString('tr-TR')} ₺` : '0 ₺'
    ]);
  }

  private getMockData(): Record<string, any> {
    const mockItems = [
      ['Web Sitesi Tasarımı', '1', 'Adet', '50.000 ₺', '50.000 ₺'],
      ['SEO Optimizasyonu', '1', 'Adet', '25.000 ₺', '25.000 ₺'],
      ['Hosting (1 Yıl)', '1', 'Adet', '5.000 ₺', '5.000 ₺']
    ];

    return {
      companyName: 'ABC Teknoloji Ltd. Şti.',
      proposalTitle: 'Web Sitesi Geliştirme Projesi',
      proposalNumber: 'TKL-2024-001',
      customerName: 'XYZ İnşaat A.Ş.',
      totalAmount: '125.000 ₺',
      createdDate: new Date().toLocaleDateString('tr-TR'),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
      paymentTerms: '30 gün vadeli',
      notes: 'Bu bir örnek teklif belgesidir.',
      proposalItemsTable: mockItems,
      proposalQRCode: 'TKL-2024-001 | XYZ İnşaat A.Ş. | 125.000 ₺',
      // Header/Footer data
      companyHeader: 'ABC Teknoloji Ltd. Şti.',
      headerLine: ' ',
      pageNumber: 'Sayfa {currentPage}/{totalPages}',
      footerLine: ' ',
      currentDate: new Date().toLocaleDateString('tr-TR'),
      companyFooter: 'www.abcteknoloji.com | info@abcteknoloji.com',
      // Summary text data
      proposalSummary: 'Teklif: TKL-2024-001 | Müşteri: XYZ İnşaat A.Ş. | Toplam: 125.000 ₺'
    };
  }
}

export const pdfmeGenerator = new PDFMeGenerator();