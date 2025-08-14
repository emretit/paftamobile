import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { supabase } from '@/integrations/supabase/client';

// Register fonts for Turkish character support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    }
  ]
});

// Simple styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 12,
    fontFamily: 'Roboto',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1F2937',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#374151',
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
    color: '#4B5563',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  table: {
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    paddingHorizontal: 5,
  },
  total: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
  }
});

// Safe text rendering function
const safeText = (text: any): string => {
  if (!text) return '';
  return String(text).normalize('NFC');
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ₺';
};

// Format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  } catch {
    return dateString;
  }
};

// Simple PDF Component
const SimplePdfDocument: React.FC<{ proposal: any }> = ({ proposal }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Title */}
      <Text style={styles.title}>TEKLİF</Text>
      
      {/* Customer and Quote Info Row */}
      <View style={styles.row}>
        {/* Customer Info */}
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          {proposal.customer?.company && (
            <Text style={styles.text}>{safeText(proposal.customer.company)}</Text>
          )}
          {proposal.customer?.name && (
            <Text style={styles.text}>Sayın {safeText(proposal.customer.name)}</Text>
          )}
          {proposal.customer?.email && (
            <Text style={styles.text}>{safeText(proposal.customer.email)}</Text>
          )}
          {proposal.customer?.phone && (
            <Text style={styles.text}>{safeText(proposal.customer.phone)}</Text>
          )}
        </View>
        
        {/* Quote Info */}
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Teklif Bilgileri</Text>
          <Text style={styles.text}>Teklif No: {safeText(proposal.number || proposal.proposal_number || 'TBD')}</Text>
          <Text style={styles.text}>Tarih: {formatDate(proposal.created_at || new Date().toISOString())}</Text>
          {proposal.valid_until && (
            <Text style={styles.text}>Geçerlilik: {formatDate(proposal.valid_until)}</Text>
          )}
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kalemler</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 3 }]}>Açıklama</Text>
            <Text style={styles.tableCell}>Miktar</Text>
            <Text style={styles.tableCell}>Birim Fiyat</Text>
            <Text style={styles.tableCell}>Toplam</Text>
          </View>
          
          {/* Table Rows */}
          {proposal.items && proposal.items.length > 0 ? 
            proposal.items.map((item: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>
                  {safeText(item.description || item.product_name || 'Ürün')}
                </Text>
                <Text style={styles.tableCell}>
                  {safeText(item.quantity || 0)} {safeText(item.unit || '')}
                </Text>
                <Text style={styles.tableCell}>
                  {formatCurrency(Number(item.unit_price || 0))}
                </Text>
                <Text style={styles.tableCell}>
                  {formatCurrency(Number(item.total || item.total_amount || 0))}
                </Text>
              </View>
            )) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 4 }]}>Henüz kalem eklenmemiş</Text>
              </View>
            )
          }
        </View>
      </View>

      {/* Totals */}
      <View style={styles.section}>
        <Text style={styles.total}>
          Toplam: {formatCurrency(Number(proposal.total_amount || 0))}
        </Text>
      </View>

      {/* Notes */}
      {proposal.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notlar</Text>
          <Text style={styles.text}>{safeText(proposal.notes)}</Text>
        </View>
      )}
    </Page>
  </Document>
);

// Simple PDF Export Service
export class SimplePdfExportService {
  /**
   * Generate PDF from proposal data
   */
  static async generatePdf(proposal: any): Promise<Blob> {
    try {
      console.log('Generating simple PDF for proposal:', {
        id: proposal.id,
        number: proposal.number || proposal.proposal_number,
        customerName: proposal.customer?.name,
        itemsCount: proposal.items?.length || 0
      });

      const pdfElement = <SimplePdfDocument proposal={proposal} />;
      const blob = await pdf(pdfElement).toBlob();
      
      console.log('PDF generated successfully');
      return blob;
    } catch (error) {
      console.error('Error generating simple PDF:', error);
      throw new Error('PDF oluşturulamadı: ' + (error as Error).message);
    }
  }

  /**
   * Download PDF
   */
  static async downloadPdf(proposal: any, filename?: string): Promise<void> {
    try {
      const blob = await this.generatePdf(proposal);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `teklif-${proposal.number || proposal.id || 'export'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  /**
   * Open PDF in new tab
   */
  static async openPdf(proposal: any): Promise<void> {
    try {
      const blob = await this.generatePdf(proposal);
      
      // Create blob URL and open in new tab
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, '_blank');
      
      if (newWindow) {
        // Clean up blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      } else {
        // Fallback to download if popup blocked
        await this.downloadPdf(proposal);
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      throw error;
    }
  }
}
