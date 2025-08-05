import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Proposal } from '@/types/proposal';
import { CompanySettings } from '@/hooks/useCompanySettings';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 30,
    paddingBottom: 65,
    paddingHorizontal: 35,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 120,
    height: 80,
    backgroundColor: '#ff0000',
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  companyDetails: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
  },
  titleSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  infoColumn: {
    flex: 1,
  },
  infoBox: {
    border: '1 solid #cccccc',
    padding: 10,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  infoText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.3,
    marginBottom: 2,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: '1 solid #cccccc',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eeeeee',
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  tableCell: {
    fontSize: 9,
    color: '#333333',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
  },
  col1: { width: '5%' },
  col2: { width: '35%' },
  col3: { width: '10%' },
  col4: { width: '10%' },
  col5: { width: '15%' },
  col6: { width: '10%' },
  col7: { width: '15%' },
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: 200,
    border: '1 solid #cccccc',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottom: '1 solid #eeeeee',
  },
  totalLabel: {
    flex: 1,
    fontSize: 9,
    color: '#333333',
  },
  totalValue: {
    width: 80,
    fontSize: 9,
    color: '#333333',
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
  },
  grandTotalLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  grandTotalValue: {
    width: 80,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'right',
  },
  termsSection: {
    marginTop: 20,
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  termsText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
    marginBottom: 10,
  },
});

interface StandardTemplateProps {
  proposal: Proposal;
  companySettings: CompanySettings;
}

export const StandardTemplate: React.FC<StandardTemplateProps> = ({ proposal, companySettings }) => {
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
    return subtotal * 0.20; // %20 KDV
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo and Company Info */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {companySettings.logo_url ? (
              <Image src={companySettings.logo_url} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={styles.logoText}>LOGO</Text>
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companySettings.company_name}</Text>
            <Text style={styles.companyDetails}>{companySettings.address}</Text>
            <Text style={styles.companyDetails}>Tel: {companySettings.phone}</Text>
            <Text style={styles.companyDetails}>E-posta: {companySettings.email}</Text>
            <Text style={styles.companyDetails}>Vergi No: {companySettings.tax_number}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>TEKLİF</Text>
        </View>

        {/* Customer and Proposal Info Side by Side */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>MÜŞTERİ BİLGİLERİ</Text>
              <Text style={styles.infoText}>Firma: {proposal.customer_name || 'Belirtilmemiş'}</Text>
              <Text style={styles.infoText}>Yetkili: {proposal.customer?.name || '-'}</Text>
              <Text style={styles.infoText}>Tel: {proposal.customer?.phone || '-'}</Text>
              <Text style={styles.infoText}>E-posta: {proposal.customer_email || '-'}</Text>
              <Text style={styles.infoText}>Adres: {proposal.customer?.address || '-'}</Text>
            </View>
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>TEKLİF BİLGİLERİ</Text>
              <Text style={styles.infoText}>Teklif No: {proposal.number || '-'}</Text>
              <Text style={styles.infoText}>Tarih: {formatDate(proposal.created_at)}</Text>
              <Text style={styles.infoText}>Geçerlilik: {proposal.valid_until ? formatDate(proposal.valid_until) : '-'}</Text>
              <Text style={styles.infoText}>Durum: {proposal.status === 'draft' ? 'Taslak' : proposal.status === 'sent' ? 'Gönderildi' : 'Onaylandı'}</Text>
              <Text style={styles.infoText}>Para Birimi: {proposal.currency}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.col1]}>#</Text>
            <Text style={[styles.tableCellHeader, styles.col2]}>AÇIKLAMA</Text>
            <Text style={[styles.tableCellHeader, styles.col3]}>MİKTAR</Text>
            <Text style={[styles.tableCellHeader, styles.col4]}>BİRİM</Text>
            <Text style={[styles.tableCellHeader, styles.col5]}>BİRİM FİYAT</Text>
            <Text style={[styles.tableCellHeader, styles.col6]}>KDV %</Text>
            <Text style={[styles.tableCellHeader, styles.col7]}>TOPLAM</Text>
          </View>
          {proposal.items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.col2]}>{item.name}</Text>
              <Text style={[styles.tableCell, styles.col3]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{item.unit || 'Adet'}</Text>
              <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(item.unit_price, proposal.currency)}</Text>
              <Text style={[styles.tableCell, styles.col6]}>20</Text>
              <Text style={[styles.tableCell, styles.col7]}>{formatCurrency(item.quantity * item.unit_price, proposal.currency)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Ara Toplam:</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateSubtotal(), proposal.currency)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>KDV (%20):</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateTax(), proposal.currency)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>GENEL TOPLAM:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(calculateTotal(), proposal.currency)}</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          {proposal.payment_terms && (
            <>
              <Text style={styles.termsTitle}>ÖDEME KOŞULLARI</Text>
              <Text style={styles.termsText}>{proposal.payment_terms}</Text>
            </>
          )}
          {proposal.delivery_terms && (
            <>
              <Text style={styles.termsTitle}>TESLİMAT KOŞULLARI</Text>
              <Text style={styles.termsText}>{proposal.delivery_terms}</Text>
            </>
          )}
          {proposal.notes && (
            <>
              <Text style={styles.termsTitle}>NOTLAR</Text>
              <Text style={styles.termsText}>{proposal.notes}</Text>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
};