import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Proposal } from '@/types/proposal';
import { CompanySettings } from '@/hooks/useCompanySettings';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 0,
    paddingBottom: 30,
    paddingHorizontal: 0,
    backgroundColor: '#ffffff',
  },
  headerBand: {
    backgroundColor: '#1e40af',
    height: 120,
    paddingHorizontal: 40,
    paddingVertical: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerText: {
    color: '#ffffff',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  companyTagline: {
    fontSize: 11,
    opacity: 0.9,
  },
  proposalTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  content: {
    paddingHorizontal: 40,
    paddingTop: 30,
  },
  proposalNumber: {
    textAlign: 'right',
    marginBottom: 30,
  },
  proposalNumberText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 30,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 20,
    borderLeft: '4 solid #1e40af',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
    marginBottom: 3,
  },
  tableContainer: {
    marginBottom: 30,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e2937',
    marginBottom: 15,
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    border: '1 solid #e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  col1: { width: '8%' },
  col2: { width: '40%' },
  col3: { width: '12%' },
  col4: { width: '15%' },
  col5: { width: '25%' },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  summaryCard: {
    width: 280,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 20,
    border: '1 solid #e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottom: '1 solid #e2e8f0',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: '#1e40af',
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  totalLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  termsSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #e2e8f0',
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  termsText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.5,
    marginBottom: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTop: '1 solid #e2e8f0',
    paddingTop: 15,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

interface ModernTemplateProps {
  proposal: Proposal;
  companySettings: any;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ proposal, companySettings }) => {
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
        {/* Modern Blue Header */}
        <View style={styles.headerBand}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              {companySettings.logo_url ? (
                <Image src={companySettings.logo_url} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={styles.logoText}>LOGO</Text>
              )}
            </View>
            <View style={styles.headerText}>
              <Text style={styles.companyName}>{companySettings.company_name}</Text>
              <Text style={styles.companyTagline}>Profesyonel Çözüm Ortağınız</Text>
            </View>
          </View>
          <View>
            <Text style={styles.proposalTitle}>TEKLİF</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Proposal Number */}
          <View style={styles.proposalNumber}>
            <Text style={styles.proposalNumberText}>
              Teklif No: {proposal.number || 'T-' + new Date().getFullYear() + '-001'}
            </Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Müşteri Bilgileri</Text>
              <Text style={styles.cardText}>Firma: {proposal.customer_name || 'Belirtilmemiş'}</Text>
              <Text style={styles.cardText}>Yetkili: {proposal.customer?.name || '-'}</Text>
              <Text style={styles.cardText}>Telefon: {proposal.customer?.phone || '-'}</Text>
              <Text style={styles.cardText}>E-posta: {proposal.customer_email || '-'}</Text>
              <Text style={styles.cardText}>Adres: {proposal.customer?.address || '-'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Teklif Detayları</Text>
              <Text style={styles.cardText}>Tarih: {formatDate(proposal.created_at)}</Text>
              <Text style={styles.cardText}>Geçerlilik: {proposal.valid_until ? formatDate(proposal.valid_until) : '-'}</Text>
              <Text style={styles.cardText}>Para Birimi: {proposal.currency}</Text>
              <Text style={styles.cardText}>Durum: {proposal.status === 'draft' ? 'Taslak' : proposal.status === 'sent' ? 'Gönderildi' : 'Onaylandı'}</Text>
            </View>
          </View>

          {/* Modern Table */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Teklif Kalemleri</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, styles.col1]}>#</Text>
                <Text style={[styles.tableCellHeader, styles.col2]}>Açıklama</Text>
                <Text style={[styles.tableCellHeader, styles.col3]}>Miktar</Text>
                <Text style={[styles.tableCellHeader, styles.col4]}>Birim Fiyat</Text>
                <Text style={[styles.tableCellHeader, styles.col5]}>Toplam</Text>
              </View>
              {proposal.items?.map((item, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
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
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ara Toplam</Text>
                <Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal(), proposal.currency)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>KDV (%20)</Text>
                <Text style={styles.summaryValue}>{formatCurrency(calculateTax(), proposal.currency)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>GENEL TOPLAM</Text>
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
                <Text style={styles.termsTitle}>Notlar</Text>
                <Text style={styles.termsText}>{proposal.notes}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {companySettings.company_name} • {companySettings.phone} • {companySettings.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
};