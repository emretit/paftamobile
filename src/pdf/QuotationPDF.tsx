/**
 * React-PDF Quotation Document Component
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { Quote } from '@/types/quote';
import { money } from '@/utils/money';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 32,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
    color: '#666',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#666',
  },
  billToSection: {
    marginBottom: 30,
  },
  billToHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  billToContent: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#333',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    fontSize: 9,
    color: '#333',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  descriptionColumn: {
    flex: 3,
  },
  qtyColumn: {
    flex: 1,
    textAlign: 'center',
  },
  priceColumn: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalColumn: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: '#666',
  },
  totalValue: {
    fontSize: 10,
    color: '#333',
  },
  grandTotalRow: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  notesSection: {
    marginTop: 30,
  },
  notesHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  notesContent: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#666',
  },
});

interface QuotationPDFProps {
  quote: Quote;
}

export default function QuotationPDF({ quote }: QuotationPDFProps): JSX.Element {
  const subtotal = quote.items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);
  const discountAmount = subtotal * (quote.discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (quote.tax_rate / 100);
  const total = taxableAmount + taxAmount;

  const formattedDate = format(new Date(quote.date), 'dd.MM.yyyy', { locale: tr });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Quotation</Text>
            <Text style={styles.subtitle}>Quote No: {quote.number}</Text>
            <Text style={styles.subtitle}>Date: {formattedDate}</Text>
          </View>
          <View style={styles.headerRight}>
            {quote.company.logo_url && (
              <Image style={styles.logo} src={quote.company.logo_url} />
            )}
            <Text style={[styles.companyInfo, { fontWeight: 'bold', fontSize: 11 }]}>
              {quote.company.name}
            </Text>
            {quote.company.address && (
              <Text style={styles.companyInfo}>{quote.company.address}</Text>
            )}
          </View>
        </View>

        {/* Bill To Section */}
        <View style={styles.billToSection}>
          <Text style={styles.billToHeader}>Bill To:</Text>
          <View style={styles.billToContent}>
            <Text style={{ fontWeight: 'bold' }}>{quote.customer.name}</Text>
            {quote.customer.email && <Text>{quote.customer.email}</Text>}
            {quote.customer.phone && <Text>{quote.customer.phone}</Text>}
            {quote.customer.address && <Text>{quote.customer.address}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.descriptionColumn]}>Description</Text>
            <Text style={[styles.tableCellHeader, styles.qtyColumn]}>Qty</Text>
            <Text style={[styles.tableCellHeader, styles.priceColumn]}>Unit Price</Text>
            <Text style={[styles.tableCellHeader, styles.totalColumn]}>Line Total</Text>
          </View>

          {/* Table Rows */}
          {quote.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionColumn]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.qtyColumn]}>
                {item.qty}
              </Text>
              <Text style={[styles.tableCell, styles.priceColumn]}>
                {money(item.unit_price, quote.currency)}
              </Text>
              <Text style={[styles.tableCell, styles.totalColumn]}>
                {money(item.qty * item.unit_price, quote.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{money(subtotal, quote.currency)}</Text>
          </View>
          
          {quote.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount ({quote.discount}%):</Text>
              <Text style={styles.totalValue}>-{money(discountAmount, quote.currency)}</Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({quote.tax_rate}%):</Text>
            <Text style={styles.totalValue}>{money(taxAmount, quote.currency)}</Text>
          </View>
          
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{money(total, quote.currency)}</Text>
          </View>
        </View>

        {/* Notes Section */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesHeader}>Notes:</Text>
            <Text style={styles.notesContent}>{quote.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}