import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { QuoteData, TemplateSchema } from '@/types/pdf-template';

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

// Safe text rendering function for Turkish characters
const safeText = (text: string): string => {
  if (!text) return '';
  // Ensure text is properly encoded
  return text.toString().normalize('NFC');
};

interface PdfRendererProps {
  data: QuoteData;
  schema: TemplateSchema;
}

const PdfRenderer: React.FC<PdfRendererProps> = ({ data, schema }) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      paddingTop: schema.page.padding.top,
      paddingRight: schema.page.padding.right,
      paddingBottom: schema.page.padding.bottom,
      paddingLeft: schema.page.padding.left,
      fontSize: schema.page.fontSize,
      fontFamily: 'Roboto',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 30,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    logo: {
      width: 120,
      height: 60,
      objectFit: 'contain',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    subtitle: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 5,
    },
    customerSection: {
      marginBottom: 30,
    },
    customerTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#374151',
    },
    customerInfo: {
      fontSize: 10,
      lineHeight: 1.4,
      color: '#4B5563',
    },
    table: {
      marginBottom: 30,
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 2,
      borderBottomColor: '#E5E7EB',
      paddingBottom: 8,
      marginBottom: 8,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: '#F3F4F6',
    },
    tableCell: {
      flex: 1,
      fontSize: 10,
    },
    tableCellHeader: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#374151',
    },
    tableCellLeft: {
      textAlign: 'left',
    },
    tableCellCenter: {
      textAlign: 'center',
    },
    tableCellRight: {
      textAlign: 'right',
    },
    totalsSection: {
      marginLeft: 'auto',
      width: 200,
      marginBottom: 30,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 3,
    },
    totalLabel: {
      fontSize: 10,
      color: '#6B7280',
    },
    totalValue: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#374151',
    },
    totalRowFinal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      marginTop: 5,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    totalLabelFinal: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    totalValueFinal: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    notesSection: {
      marginTop: 'auto',
    },
    notesText: {
      fontSize: 9,
      color: '#6B7280',
      lineHeight: 1.4,
      marginBottom: 5,
    },
    footer: {
      marginTop: 20,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      fontSize: 8,
      color: '#9CA3AF',
      textAlign: 'center',
    },
  });

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    // Manual formatting to avoid symbol rendering issues in PDF
    const formatted = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    const symbol = currency === 'TRY' ? '₺' : currency;
    return `${formatted} ${symbol}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: tr });
    } catch {
      return dateString;
    }
  };

  const getColumnStyle = (align: string) => {
    switch (align) {
      case 'center':
        return styles.tableCellCenter;
      case 'right':
        return styles.tableCellRight;
      default:
        return styles.tableCellLeft;
    }
  };

  const renderCustomerField = (fieldKey: string, customer: QuoteData['customer']) => {
    if (!customer) return null;

    const fieldMap: Record<string, string | undefined> = {
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.mobile_phone || customer.office_phone,
      address: customer.address,
      tax_number: customer.tax_number,
      tax_office: customer.tax_office,
    };

    const value = fieldMap[fieldKey];
    if (!value) return null;

    const labelMap: Record<string, string> = {
      name: 'Ad Soyad',
      company: 'Şirket',
      email: 'E-posta',
      phone: 'Telefon',
      address: 'Adres',
      tax_number: 'Vergi No',
      tax_office: 'Vergi Dairesi',
    };

    return (
      <Text key={fieldKey} style={styles.customerInfo}>
        {safeText(`${labelMap[fieldKey]}: ${value}`)}
      </Text>
    );
  };

  return (
    <Document>
      <Page size={schema.page.size === "LETTER" ? "LETTER" : schema.page.size} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {schema.header.showLogo && data.company?.logo_url && (
              <Image style={styles.logo} src={data.company.logo_url} />
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.title}>{safeText(schema.header.title)}</Text>
            <Text style={styles.subtitle}>#{safeText(data.number)}</Text>
            {schema.header.showValidity && data.valid_until && (
              <Text style={styles.subtitle}>
                {safeText(`Geçerlilik: ${formatDate(data.valid_until)}`)}
              </Text>
            )}
          </View>
        </View>

        {/* Customer Information */}
        {schema.customerBlock.show && data.customer && (
          <View style={styles.customerSection}>
            <Text style={styles.customerTitle}>{safeText('Müşteri Bilgileri')}</Text>
            {schema.customerBlock.fields.map(fieldKey => 
              renderCustomerField(fieldKey, data.customer)
            )}
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {schema.lineTable.columns
              .filter(col => col.show)
              .map(col => (
                <View key={col.key} style={[styles.tableCell, { flex: col.key === 'description' ? 3 : 1 }]}>
                  <Text style={[styles.tableCellHeader, getColumnStyle(col.align)]}>
                    {safeText(col.label)}
                  </Text>
                </View>
              ))
            }
          </View>

          {/* Table Rows */}
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              {schema.lineTable.columns
                .filter(col => col.show)
                .map(col => (
                  <View key={col.key} style={[styles.tableCell, { flex: col.key === 'description' ? 3 : 1 }]}>
                    <Text style={[styles.tableCell, getColumnStyle(col.align)]}>
                      {col.key === 'description' && safeText(item.description)}
                      {col.key === 'quantity' && safeText(`${item.quantity} ${item.unit || ''}`)}
                      {col.key === 'unit_price' && safeText(formatCurrency(item.unit_price, data.currency))}
                      {col.key === 'total' && safeText(formatCurrency(item.total, data.currency))}
                    </Text>
                  </View>
                ))
              }
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          {schema.totals.showGross && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{safeText('Ara Toplam:')}</Text>
              <Text style={styles.totalValue}>
                {safeText(formatCurrency(data.subtotal, data.currency))}
              </Text>
            </View>
          )}
          
          {schema.totals.showDiscount && data.total_discount && data.total_discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{safeText('İndirim:')}</Text>
              <Text style={styles.totalValue}>
                {safeText(`-${formatCurrency(data.total_discount, data.currency)}`)}
              </Text>
            </View>
          )}
          
          {schema.totals.showTax && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{safeText('KDV:')}</Text>
              <Text style={styles.totalValue}>
                {safeText(formatCurrency(data.total_tax, data.currency))}
              </Text>
            </View>
          )}
          
          {schema.totals.showNet && (
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalLabelFinal}>{safeText('Genel Toplam:')}</Text>
              <Text style={styles.totalValueFinal}>
                {safeText(formatCurrency(data.total_amount, data.currency))}
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          {schema.notes.intro && (
            <Text style={styles.notesText}>{safeText(schema.notes.intro)}</Text>
          )}
          {data.notes && (
            <Text style={styles.notesText}>{safeText(data.notes)}</Text>
          )}
          {data.payment_terms && (
            <Text style={styles.notesText}>{safeText(`Ödeme Şartları: ${data.payment_terms}`)}</Text>
          )}
          {data.delivery_terms && (
            <Text style={styles.notesText}>{safeText(`Teslimat Şartları: ${data.delivery_terms}`)}</Text>
          )}
          {data.warranty_terms && (
            <Text style={styles.notesText}>{safeText(`Garanti Şartları: ${data.warranty_terms}`)}</Text>
          )}
        </View>

        {/* Footer */}
        {schema.notes.footer && (
          <View style={styles.footer}>
            <Text>{safeText(schema.notes.footer)}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default PdfRenderer;
