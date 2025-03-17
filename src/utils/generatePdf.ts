
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProposalFormData } from '@/types/proposal-form';
import { ProposalItem } from '@/types/proposal';
import { Customer } from '@/types/customer';

export const generateProposalPdf = (data: ProposalFormData, customer: Customer) => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text('Teklif', 105, 20, { align: 'center' });
  
  // Add customer info
  doc.setFontSize(12);
  doc.text(`Müşteri: ${customer.name}`, 20, 40);
  if (customer.company) doc.text(`Firma: ${customer.company}`, 20, 48);
  if (customer.address) doc.text(`Adres: ${customer.address}`, 20, 56);
  
  // Add proposal details
  doc.text(`Teklif No: ${Date.now()}`, 20, 72);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 20, 80);
  if (data.valid_until) {
    doc.text(`Geçerlilik: ${new Date(data.valid_until).toLocaleDateString('tr-TR')}`, 20, 88);
  }

  // Add items table
  const tableData = data.items.map((item: ProposalItem) => [
    item.name,
    item.quantity.toString(),
    `₺${item.unit_price.toFixed(2)}`,
    `%${item.tax_rate}`,
    `₺${item.total_price.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['Ürün/Hizmet', 'Miktar', 'Birim Fiyat', 'KDV', 'Toplam']],
    body: tableData,
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`İndirimler: ₺${data.discounts?.toFixed(2) || '0.00'}`, 140, finalY);
  doc.text(`Ek Ücretler: ₺${data.additionalCharges?.toFixed(2) || '0.00'}`, 140, finalY + 8);
  doc.text(`Genel Toplam: ₺${(
    tableData.reduce((sum, [, , , , total]) => sum + parseFloat(total.replace('₺', '')), 0) +
    (data.additionalCharges || 0) - (data.discounts || 0)
  ).toFixed(2)}`, 140, finalY + 16);

  return doc;
};
