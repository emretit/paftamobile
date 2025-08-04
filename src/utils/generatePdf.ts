
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '@/utils/formatters';

interface HeaderInfo {
  title: string;
  companyName?: string;
  companyLogo?: string;
  date: string;
  number: string;
}

interface FooterInfo {
  notes?: string;
  terms?: string;
  contactInfo?: string;
}

interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
}

interface TableData {
  columns: TableColumn[];
  rows: any[];
  totals?: {
    label: string;
    value: string;
  }[];
}

export const generatePdf = (
  header: HeaderInfo,
  table: TableData,
  footer: FooterInfo,
  orientation: 'portrait' | 'landscape' = 'portrait'
) => {
  // Create a new PDF document
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = orientation === 'portrait' ? 210 : 297;
  const contentWidth = pageWidth - 40; // 20mm margins on each side
  
  // Set font
  pdf.setFont('helvetica');
  
  // Add header
  pdf.setFontSize(20);
  pdf.text(header.title, 20, 20);
  
  // Add company name if provided
  if (header.companyName) {
    pdf.setFontSize(12);
    pdf.text(header.companyName, 20, 30);
  }
  
  // Add date and document number
  pdf.setFontSize(10);
  pdf.text(`Tarih: ${header.date}`, 20, 40);
  pdf.text(`No: ${header.number}`, 20, 45);
  
  // Add table
  // @ts-ignore - jspdf-autotable adds this method
  pdf.autoTable({
    startY: 55,
    head: [table.columns.map(col => col.header)],
    body: table.rows.map(row => 
      table.columns.map(col => {
        let value = row[col.dataKey];
        
        // Format currency values
        if (typeof value === 'number' && (
          col.dataKey.includes('price') || 
          col.dataKey.includes('total') || 
          col.dataKey.includes('amount')
        )) {
          value = formatCurrency(value);
        }
        
        return value;
      })
    ),
    margin: { top: 10, right: 20, bottom: 10, left: 20 },
    styles: { overflow: 'linebreak', cellPadding: 5 },
    columnStyles: table.columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>)
  });
  
  // Add totals if provided
  if (table.totals && table.totals.length > 0) {
    const currentY = (pdf as any).lastAutoTable.finalY + 10;
    pdf.setFontSize(10);
    
    table.totals.forEach((total, index) => {
      const y = currentY + (index * 7);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(total.label, pageWidth - 70, y);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(total.value, pageWidth - 20, y, { align: 'right' });
    });
  }
  
  // Add footer
  const footerY = (pdf as any).lastAutoTable.finalY + 30;
  
  if (footer.notes) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notlar:', 20, footerY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(footer.notes, 20, footerY + 7, {
      maxWidth: contentWidth
    });
  }
  
  if (footer.terms) {
    const termsY = footer.notes ? footerY + 25 : footerY;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Şartlar ve Koşullar:', 20, termsY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(footer.terms, 20, termsY + 7, {
      maxWidth: contentWidth
    });
  }
  
  if (footer.contactInfo) {
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(footer.contactInfo, pageWidth / 2, pdf.internal.pageSize.height - 10, {
      align: 'center'
    });
  }
  
  // PDF'yi yeni sekmede aç ve yazdır
  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(pdfUrl, '_blank');
  
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
