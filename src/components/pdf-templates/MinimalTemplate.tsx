import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Proposal } from '@/types/proposal';
import { CompanySettings } from '@/hooks/useCompanySettings';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: '2 solid #000000',
  },
  logoSection: {
    flex: 1,
  },
  logoContainer: {
    width: 80,
    height: 50,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.3,
  },
  proposalSection: {
    textAlign: 'right',
  },
  proposalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  proposalSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 40,
  },
  infoColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoText: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
    marginBottom: 4,
  },
  tableSection: {
    marginBottom: 30,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  table: {
    borderTop: '2 solid #000000',
    borderBottom: '1 solid #000000',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottom: '1 solid #000000',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottom: '0.5 solid #cccccc',
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
  },
  col1: { width: '8%' },
  col2: { width: '50%' },
  col3: { width: '12%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  summarySection: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  summaryTable: {
    width: 200,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottom: '0.5 solid #cccccc',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 5,
    borderTop: '2 solid #000000',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  termsSection: {
    marginTop: 50,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  termsText: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.5,
    marginBottom: 20,
    textAlign: 'justify',
  },
  signature: {
    marginTop: 60,
    alignItems: 'flex-end',
  },
  signatureText: {
    fontSize: 10,
    color: '#666666',
    borderTop: '1 solid #000000',
    paddingTop: 5,
    width: 150,
    textAlign: 'center',
  },
});

interface MinimalTemplateProps {
  proposal: Proposal;
  companySettings: CompanySettings;
}

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ proposal, companySettings }) => {
  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const calculateSubtotal = () => {
    return proposal.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.20;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Clean Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              {companySettings.logo_url ? (
                <Image src={companySettings.logo_url} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={styles.logoText}>LOGO</Text>
              )}
            </View>
            <Text style={styles.companyName}>{companySettings.company_name}</Text>
            <Text style={styles.companyDetails}>{companySettings.address}</Text>
            <Text style={styles.companyDetails}>{companySettings.phone} • {companySettings.email}</Text>
            <Text style={styles.companyDetails}>Vergi No: {companySettings.tax_number}</Text>
          </View>
          <View style={styles.proposalSection}>
            <Text style={styles.proposalTitle}>TEKLIF</Text>
            <Text style={styles.proposalSubtitle}>
              No: {proposal.number || 'T-' + new Date().getFullYear() + '-001'}
            </Text>
            <Text style={styles.proposalSubtitle}>
              Tarih: {formatDate(proposal.created_at)}
            </Text>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Müşteri</Text>
            <Text style={styles.infoText}>{proposal.customer_name || 'Belirtilmemiş'}</Text>
            <Text style={styles.infoText}>{proposal.customer?.name || '-'}</Text>
            <Text style={styles.infoText}>{proposal.customer?.phone || '-'}</Text>
            <Text style={styles.infoText}>{proposal.customer_email || '-'}</Text>
            <Text style={styles.infoText}>{proposal.customer?.address || '-'}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Teklif Detayları</Text>
            <Text style={styles.infoText}>Geçerlilik: {proposal.valid_until ? formatDate(proposal.valid_until) : '-'}</Text>
            <Text style={styles.infoText}>Para Birimi: {proposal.currency}</Text>
            <Text style={styles.infoText}>
              Durum: {proposal.status === 'draft' ? 'Taslak' : proposal.status === 'sent' ? 'Gönderildi' : 'Onaylandı'}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>Kalemler</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, styles.col1]}>#</Text>
              <Text style={[styles.tableCellHeader, styles.col2]}>Açıklama</Text>
              <Text style={[styles.tableCellHeader, styles.col3]}>Miktar</Text>
              <Text style={[styles.tableCellHeader, styles.col4]}>Birim Fiyat</Text>
              <Text style={[styles.tableCellHeader, styles.col5]}>Toplam</Text>
            </View>
            {proposal.items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{item.name}</Text>
                <Text style={[styles.tableCell, styles.col3]}>{item.quantity} {item.unit || 'Adet'}</Text>
                <Text style={[styles.tableCell, styles.col4]}>{formatCurrency(item.unit_price, proposal.currency)}</Text>
                <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(item.quantity * item.unit_price, proposal.currency)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ara Toplam</Text>
              <Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal(), proposal.currency)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>KDV (%20)</Text>
              <Text style={styles.summaryValue}>{formatCurrency(calculateTax(), proposal.currency)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateTotal(), proposal.currency)}</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          {proposal.payment_terms && (
            <>
              <Text style={styles.termsTitle}>Ödeme Koşulları</Text>
              <Text style={styles.termsText}>{proposal.payment_terms}</Text>
            </>
          )}
          {proposal.delivery_terms && (
            <>
              <Text style={styles.termsTitle}>Teslimat Koşulları</Text>
              <Text style={styles.termsText}>{proposal.delivery_terms}</Text>
            </>
          )}
          {proposal.notes && (
            <>
              <Text style={styles.termsTitle}>Ek Notlar</Text>
              <Text style={styles.termsText}>{proposal.notes}</Text>
            </>
          )}
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureText}>Yetkili İmza</Text>
        </View>
      </Page>
    </Document>
  );
};