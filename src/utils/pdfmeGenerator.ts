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
    
    // Basit ve sade field mapping
    const fieldMappings: Record<string, any> = {
      // Temel Bilgiler
      teklifBasligi: proposal.title || 'Teklif Başlığı',
      teklifNo: proposal.number || proposal.proposal_number || 'TKL-001',
      teklifTarihi: (proposal as any)?.offer_date ? new Date((proposal as any).offer_date).toLocaleDateString('tr-TR') : 
                     proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : 
                     new Date().toLocaleDateString('tr-TR'),
      gecerlilikTarihi: (proposal as any)?.validity_date ? new Date((proposal as any).validity_date).toLocaleDateString('tr-TR') :
                        proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : '',
      
      // Müşteri Bilgileri
      musteriAdi: (proposal as any)?.customer_company || proposal.customer_name || 'Müşteri Firma Adı',
      musteriAdres: (proposal as any)?.customer_address || (proposal as any)?.customer?.address || '',
      musteriTelefon: (proposal as any)?.customer_phone || (proposal as any)?.customer?.phone || (proposal as any)?.customer?.mobile_phone || '',
      
      // Ürün/Hizmet Tablosu
      urunTablosu: proposalItems,
      
      // Mali Bilgiler
      brutToplam: `${computedSubTotal.toLocaleString('tr-TR')} ₺`,
      indirim: `${discountAmount.toLocaleString('tr-TR')} ₺`,
      kdvTutari: `${((computedSubTotal - discountAmount) * 0.20).toLocaleString('tr-TR')} ₺`,
      genelToplam: `${totalAmount.toLocaleString('tr-TR')} ₺`,
      
      // Şartlar
      odemeKosullari: proposal.payment_terms || '',
      teslimatKosullari: proposal.delivery_terms || ''
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
      // Temel Bilgiler
      teklifBasligi: 'Web Sitesi Geliştirme Projesi',
      teklifNo: 'TKL-2024-001',
      teklifTarihi: new Date().toLocaleDateString('tr-TR'),
      gecerlilikTarihi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
      
      // Müşteri Bilgileri
      musteriAdi: 'XYZ İnşaat A.Ş.',
      musteriAdres: 'Sanayi Mah. İnşaat Cd. No:456 Kadıköy/İstanbul',
      musteriTelefon: '+90 216 555 0123',
      
      // Ürün/Hizmet
      urunTablosu: mockItems,
      
      // Mali Bilgiler
      brutToplam: '80.000 ₺',
      indirim: '5.000 ₺',
      kdvTutari: '15.000 ₺',
      genelToplam: '90.000 ₺',
      
      // Şartlar
      odemeKosullari: 'Siparişle birlikte %50 avans, teslimde kalan tutar ödenecektir.',
      teslimatKosullari: 'Teslimat süresi: Sipariş tarihinden itibaren 15-20 iş günü'
    };
  }
}

export const pdfmeGenerator = new PDFMeGenerator();