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
      proposalDescription: proposal.description || '',
      customerName: proposal.customer_name || 'Müşteri Adı',
      customerAddress: (proposal as any)?.customer_address || '',
      customerTaxNo: (proposal as any)?.customer_tax_no || '',
      totalAmount: proposal.total_amount ? `${proposal.total_amount.toLocaleString('tr-TR')} ₺` : '0 ₺',
      createdDate: proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
      validUntil: proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : '',
      paymentTerms: proposal.payment_terms || '',
      deliveryTerms: (proposal as any)?.delivery_terms || '',
      warrantyTerms: (proposal as any)?.warranty_terms || '',
      priceTerms: (proposal as any)?.price_terms || '',
      otherTerms: (proposal as any)?.other_terms || '',
      notes: proposal.notes || '',
      // Table data for proposal items
      proposalItemsTable: proposalItems,
      // Totals
      subTotal: `${computedSubTotal.toLocaleString('tr-TR')} ₺`,
      discountAmount: `${discountAmount.toLocaleString('tr-TR')} ₺`,
      netTotal: `${totalAmount.toLocaleString('tr-TR')} ₺`,
      additionalCharges: `${Number((proposal as any)?.additional_charges || 0).toLocaleString('tr-TR')} ₺`,
      discounts: `${Number((proposal as any)?.discounts || discountAmount).toLocaleString('tr-TR')} ₺`,
      currency: (proposal as any)?.currency || 'TRY',
      status: (proposal as any)?.status || '',
      employeeName: (proposal as any)?.employee_name || (proposal as any)?.employee?.first_name ? `${(proposal as any)?.employee?.first_name} ${(proposal as any)?.employee?.last_name}` : '',
      opportunityTitle: (proposal as any)?.opportunity_title || (proposal as any)?.opportunity?.title || '',
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
      companyLogo: '',
      companyAddress: 'Merkez Mah. Teknoloji Cd. No:1 İstanbul',
      companyContact: 'hello@abc.com | +90 212 000 00 00',
      proposalTitle: 'Web Sitesi Geliştirme Projesi',
      proposalNumber: 'TKL-2024-001',
      proposalDescription: 'Kurumsal web sitesi ve SEO hizmetleri',
      customerName: 'XYZ İnşaat A.Ş.',
      customerAddress: 'Sanayi Mah. İnşaat Cd. No:456 Kadıköy/İstanbul',
      customerTaxNo: 'VKN: 1234567890',
      totalAmount: '125.000 ₺',
      createdDate: new Date().toLocaleDateString('tr-TR'),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
      paymentTerms: '30 gün vadeli',
      deliveryTerms: 'Teslimat 2-4 hafta',
      warrantyTerms: '12 ay garanti',
      priceTerms: 'KDV hariçtir',
      otherTerms: 'Diğer özel koşullar',
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