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
    
    // Map proposal fields to match NewProposalCreate form structure
    const fieldMappings: Record<string, any> = {
      // Şirket Bilgileri
      companyName: (proposal as any)?.company_name || 'Şirket Adı',
      companyLogo: (proposal as any)?.company_logo || '',
      companyAddress: (proposal as any)?.company_address || '',
      companyContact: (proposal as any)?.company_contact || '',
      
      // Müşteri Bilgileri (NewProposalCreate form fields)
      customerCompany: (proposal as any)?.customer_company || proposal.customer_name || 'Müşteri Firma Adı',
      contactName: (proposal as any)?.contact_name || (proposal as any)?.customer?.name || '',
      contactTitle: (proposal as any)?.contact_title || '',
      customerEmail: (proposal as any)?.customer_email || (proposal as any)?.customer?.email || '',
      customerPhone: (proposal as any)?.customer_phone || (proposal as any)?.customer?.phone || (proposal as any)?.customer?.mobile_phone || '',
      customerAddress: (proposal as any)?.customer_address || (proposal as any)?.customer?.address || '',
      customerTaxNumber: (proposal as any)?.customer_tax_number || (proposal as any)?.customer?.tax_number || '',
      customerTaxOffice: (proposal as any)?.customer_tax_office || (proposal as any)?.customer?.tax_office || '',
      
      // Teklif Bilgileri
      proposalTitle: proposal.title || 'Teklif Başlığı',
      proposalNumber: proposal.number || proposal.proposal_number || 'TKL-001',
      offerDate: (proposal as any)?.offer_date ? new Date((proposal as any).offer_date).toLocaleDateString('tr-TR') : 
                  proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : 
                  new Date().toLocaleDateString('tr-TR'),
      validityDate: (proposal as any)?.validity_date ? new Date((proposal as any).validity_date).toLocaleDateString('tr-TR') :
                     proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : '',
      proposalDescription: proposal.description || '',
      proposalStatus: proposal.status || '',
      employeeName: (proposal as any)?.employee_name || 
                    (proposal as any)?.employee?.first_name ? `${(proposal as any)?.employee?.first_name} ${(proposal as any)?.employee?.last_name}` : 
                    (proposal as any)?.prepared_by || '',
      opportunityTitle: (proposal as any)?.opportunity_title || (proposal as any)?.opportunity?.title || '',
      proposalNotes: proposal.notes || (proposal as any)?.notes || '',
      
      // Ürün/Hizmet Tablosu
      proposalItemsTable: proposalItems,
      
      // Mali Bilgiler (NewProposalCreate calculations)
      currency: (proposal as any)?.currency || 'TRY',
      grossTotal: `${computedSubTotal.toLocaleString('tr-TR')} ₺`,
      discountAmount: `${discountAmount.toLocaleString('tr-TR')} ₺`,
      netTotal: `${(computedSubTotal - discountAmount).toLocaleString('tr-TR')} ₺`,
      vatAmount: `${((computedSubTotal - discountAmount) * 0.20).toLocaleString('tr-TR')} ₺`, // 20% KDV varsayımı
      vatPercentage: (proposal as any)?.vat_percentage ? `%${(proposal as any).vat_percentage}` : '%20',
      grandTotal: `${totalAmount.toLocaleString('tr-TR')} ₺`,
      additionalCharges: `${Number((proposal as any)?.additional_charges || 0).toLocaleString('tr-TR')} ₺`,
      
      // Şartlar ve Koşullar (NewProposalCreate form fields)
      paymentTerms: proposal.payment_terms || '',
      deliveryTerms: proposal.delivery_terms || '',
      warrantyTerms: proposal.warranty_terms || '',
      priceTerms: proposal.price_terms || '',
      otherTerms: proposal.other_terms || '',
      generalTerms: proposal.terms || 'Genel şartlar ve koşullar',
      
      // Ek Özellikler
      proposalQRCode: `${proposal.number || proposal.proposal_number || 'TKL-001'} | ${(proposal as any)?.customer_company || proposal.customer_name || 'Müşteri'} | ${totalAmount.toLocaleString('tr-TR')} ₺`,
      proposalSummary: `Teklif: ${proposal.number || proposal.proposal_number || 'TKL-001'} | Müşteri: ${(proposal as any)?.customer_company || proposal.customer_name || 'Müşteri'} | Toplam: ${totalAmount.toLocaleString('tr-TR')} ₺`,
      createdAt: proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
      updatedAt: proposal.updated_at ? new Date(proposal.updated_at).toLocaleDateString('tr-TR') : ''
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
      return [['Ürün/Hizmet bulunamadı', '-', '-', '-', '-', '-']];
    }

    return items.map(item => [
      item.name || 'Ürün',
      item.description || '',
      (item.quantity || 0).toString(),
      item.unit || 'Adet',
      item.unit_price ? `${item.unit_price.toLocaleString('tr-TR')} ₺` : '0 ₺',
      item.total_price ? `${item.total_price.toLocaleString('tr-TR')} ₺` : '0 ₺'
    ]);
  }

  private getMockData(): Record<string, any> {
    const mockItems = [
      ['Web Sitesi Tasarımı', 'Modern responsive tasarım', '1', 'Adet', '50.000 ₺', '50.000 ₺'],
      ['SEO Optimizasyonu', 'Arama motoru optimizasyonu', '1', 'Adet', '25.000 ₺', '25.000 ₺'],
      ['Hosting (1 Yıl)', 'Premium hosting hizmeti', '1', 'Adet', '5.000 ₺', '5.000 ₺']
    ];

    return {
      // Şirket Bilgileri
      companyName: 'ABC Teknoloji Ltd. Şti.',
      companyLogo: '',
      companyAddress: 'Merkez Mah. Teknoloji Cd. No:1 İstanbul',
      companyContact: 'hello@abc.com | +90 212 000 00 00',
      
      // Müşteri Bilgileri
      customerCompany: 'XYZ İnşaat A.Ş.',
      contactName: 'Ahmet Yılmaz',
      contactTitle: 'Genel Müdür',
      customerEmail: 'ahmet@xyzinsaat.com',
      customerPhone: '+90 216 555 0123',
      customerAddress: 'Sanayi Mah. İnşaat Cd. No:456 Kadıköy/İstanbul',
      customerTaxNumber: '1234567890',
      customerTaxOffice: 'Kadıköy VD',
      
      // Teklif Bilgileri
      proposalTitle: 'Web Sitesi Geliştirme Projesi',
      proposalNumber: 'TKL-2024-001',
      offerDate: new Date().toLocaleDateString('tr-TR'),
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
      proposalDescription: 'Kurumsal web sitesi ve SEO hizmetleri için kapsamlı teklif',
      proposalStatus: 'Gönderildi',
      employeeName: 'Mehmet Demir',
      opportunityTitle: 'Dijital Dönüşüm Projesi',
      proposalNotes: 'Bu bir örnek teklif belgesidir.',
      
      // Ürün/Hizmet
      proposalItemsTable: mockItems,
      
      // Mali Bilgiler
      currency: 'TRY',
      grossTotal: '80.000 ₺',
      discountAmount: '5.000 ₺',
      netTotal: '75.000 ₺',
      vatAmount: '15.000 ₺',
      vatPercentage: '%20',
      grandTotal: '90.000 ₺',
      additionalCharges: '0 ₺',
      
      // Şartlar
      paymentTerms: 'Siparişle birlikte %50 avans, teslimde kalan tutar ödenecektir.',
      deliveryTerms: 'Teslimat süresi: Sipariş tarihinden itibaren 15-20 iş günü',
      warrantyTerms: 'Ürünlerimiz 2 yıl garantilidir.',
      priceTerms: 'Fiyatlarımız KDV hariçtir.',
      otherTerms: 'Diğer özel koşullar ve şartlar burada yer alır.',
      generalTerms: 'Bu teklif 30 gün geçerlidir. Fiyatlar TL olup KDV hariçtir.',
      
      // Ek Özellikler
      proposalQRCode: 'TKL-2024-001 | XYZ İnşaat A.Ş. | 90.000 ₺',
      proposalSummary: 'Teklif: TKL-2024-001 | Müşteri: XYZ İnşaat A.Ş. | Toplam: 90.000 ₺',
      createdAt: new Date().toLocaleDateString('tr-TR'),
      updatedAt: new Date().toLocaleDateString('tr-TR')
    };
  }
}

export const pdfmeGenerator = new PDFMeGenerator();