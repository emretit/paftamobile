import React from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Very simple test PDF
const TestDocument = () => (
  <Document>
    <Page size="A4" style={{ padding: 30 }}>
      <View>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>Test PDF</Text>
        <Text style={{ fontSize: 12 }}>Bu bir test PDF'idir.</Text>
        <Text style={{ fontSize: 12 }}>React-PDF çalışıyor mu kontrol ediyoruz.</Text>
      </View>
    </Page>
  </Document>
);

export const testReactPdf = async () => {
  try {
    console.log('Testing React-PDF...');
    
    const pdfDocument = pdf(<TestDocument />);
    const pdfBlob = await pdfDocument.toBlob();
    
    console.log('React-PDF test successful! Blob size:', pdfBlob.size);
    
    // Open in new tab
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        console.log('Test PDF opened successfully');
        printWindow.print();
      };
    }
    
    return true;
  } catch (error) {
    console.error('React-PDF test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return false;
  }
};