import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Proposal } from '@/types/proposal';
import { formatCurrency } from '@/utils/formatters';

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

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = 210;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
  }

  generateProposalPdf(proposal: Proposal, companyInfo?: CompanyInfo): void {
    this.pdf.setFont('helvetica');
    
    let currentY = this.addHeader(proposal, companyInfo);
    currentY = this.addProposalInfo(proposal, currentY);
    currentY = this.addCustomerInfo(proposal, currentY);
    currentY = this.addItemsTable(proposal, currentY);
    currentY = this.addTotals(proposal, currentY);
    this.addFooter(proposal, currentY);

    // Dosya adı oluştur
    const fileName = `Teklif_${proposal.number}_${proposal.customer?.name?.replace(/\s+/g, '_') || 'Musteri'}.pdf`;
    this.pdf.save(fileName);
  }

  private addHeader(proposal: Proposal, companyInfo?: CompanyInfo): number {
    let currentY = 20;

    // Şirket bilgileri (sol)
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(companyInfo?.name || 'Şirket Adı', this.marginLeft, currentY);
    
    currentY += 8;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    if (companyInfo?.address) {
      this.pdf.text(companyInfo.address, this.marginLeft, currentY);
      currentY += 5;
    }
    if (companyInfo?.phone) {
      this.pdf.text(`Tel: ${companyInfo.phone}`, this.marginLeft, currentY);
      currentY += 5;
    }
    if (companyInfo?.email) {
      this.pdf.text(`E-posta: ${companyInfo.email}`, this.marginLeft, currentY);
      currentY += 5;
    }
    if (companyInfo?.taxNumber) {
      this.pdf.text(`Vergi No: ${companyInfo.taxNumber}`, this.marginLeft, currentY);
      currentY += 5;
    }

    // Teklif başlığı (sağ)
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TEKLİF', this.pageWidth - this.marginRight, 30, { align: 'right' });

    return Math.max(currentY + 10, 50);
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

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TEKLİF KALEMLERI', this.marginLeft, startY);

    const tableData = proposal.items.map((item, index) => [
      (index + 1).toString(),
      item.name || '',
      item.description || '',
      item.quantity?.toString() || '1',
      'Adet',
      formatCurrency(item.unit_price || 0),
      formatCurrency((item.quantity || 1) * (item.unit_price || 0))
    ]);

    // @ts-ignore
    this.pdf.autoTable({
      startY: startY + 8,
      head: [['#', 'Ürün/Hizmet', 'Açıklama', 'Miktar', 'Birim', 'Birim Fiyat', 'Toplam']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [71, 85, 105], // slate-600
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
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

  private addFooter(proposal: Proposal, startY: number): void {
    let currentY = startY;

    // Ödeme şartları
    if (proposal.payment_terms) {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('ÖDEME ŞARTLARI:', this.marginLeft, currentY);
      currentY += 6;
      
      this.pdf.setFont('helvetica', 'normal');
      const paymentTermsLines = this.pdf.splitTextToSize(proposal.payment_terms, this.contentWidth);
      this.pdf.text(paymentTermsLines, this.marginLeft, currentY);
      currentY += paymentTermsLines.length * 5 + 5;
    }

    // Teslimat şartları
    if (proposal.delivery_terms) {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('TESLİMAT ŞARTLARI:', this.marginLeft, currentY);
      currentY += 6;
      
      this.pdf.setFont('helvetica', 'normal');
      const deliveryTermsLines = this.pdf.splitTextToSize(proposal.delivery_terms, this.contentWidth);
      this.pdf.text(deliveryTermsLines, this.marginLeft, currentY);
      currentY += deliveryTermsLines.length * 5 + 5;
    }

    // Notlar
    if (proposal.notes) {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('NOTLAR:', this.marginLeft, currentY);
      currentY += 6;
      
      this.pdf.setFont('helvetica', 'normal');
      const notesLines = this.pdf.splitTextToSize(proposal.notes, this.contentWidth);
      this.pdf.text(notesLines, this.marginLeft, currentY);
      currentY += notesLines.length * 5 + 10;
    }

    // Footer
    const footerY = this.pdf.internal.pageSize.height - 20;
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(128, 128, 128);
    this.pdf.text(
      'Bu teklif elektronik ortamda oluşturulmuş olup imza gerektirmez.',
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );
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
}