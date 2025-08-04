import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data: any[], filename: string) => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Excel dosyası oluşturulamadı');
  }
};

export const exportToPDF = (data: any[], filename: string, columns: { header: string; dataKey: string }[]) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(filename.toUpperCase(), 20, 20);
    
    // Prepare table data
    const tableData = data.map(item => 
      columns.map(col => {
        const value = item[col.dataKey];
        if (col.dataKey.includes('date') && value) {
          return new Date(value).toLocaleDateString('tr-TR');
        }
        if (typeof value === 'number') {
          return value.toLocaleString('tr-TR');
        }
        return value || '-';
      })
    );
    
    // Add table
    (doc as any).autoTable({
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255
      }
    });
    
    // PDF'yi yeni sekmede aç ve yazdır
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('PDF dosyası oluşturulamadı');
  }
};