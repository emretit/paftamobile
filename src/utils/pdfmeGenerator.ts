import { Proposal } from '@/types/proposal';

export class PDFMeGenerator {
  async generateProposalPDF(proposal: Proposal, template: any): Promise<void> {
    try {
      // Dynamically import PDFMe to avoid SSR issues
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes } = await import('@pdfme/schemas');
      
      // Map proposal data to template inputs
      const inputs = this.mapProposalToInputs(proposal, template);
      
      // Generate PDF with type assertion for plugins
      const pdf = await generate({
        template,
        inputs: [inputs],
        plugins: { text, image, qrcode: barcodes.qrcode } as any
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
      const { text, image, barcodes } = await import('@pdfme/schemas');
      
      // Use mock data or default values
      const inputs = mockData || this.getMockData();
      
      const pdf = await generate({
        template,
        inputs: [inputs],
        plugins: { text, image, qrcode: barcodes.qrcode } as any
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
    
    // Map common proposal fields
    const fieldMappings: Record<string, any> = {
      companyName: 'Şirket Adı',
      proposalTitle: proposal.title || 'Teklif Başlığı',
      proposalNumber: proposal.proposal_number || 'TKL-001',
      customerName: proposal.customer_name || 'Müşteri Adı',
      totalAmount: proposal.total_amount ? `${proposal.total_amount.toLocaleString('tr-TR')} ₺` : '0 ₺',
      createdDate: proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
      validUntil: proposal.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : '',
      paymentTerms: proposal.payment_terms || 'Standart ödeme koşulları',
      notes: proposal.notes || ''
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

  private getMockData(): Record<string, any> {
    return {
      companyName: 'ABC Teknoloji Ltd. Şti.',
      proposalTitle: 'Web Sitesi Geliştirme Projesi',
      proposalNumber: 'TKL-2024-001',
      customerName: 'XYZ İnşaat A.Ş.',
      totalAmount: '125.000 ₺',
      createdDate: new Date().toLocaleDateString('tr-TR'),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
      paymentTerms: '30 gün vadeli',
      notes: 'Bu bir örnek teklif belgesidir.'
    };
  }
}

export const pdfmeGenerator = new PDFMeGenerator();