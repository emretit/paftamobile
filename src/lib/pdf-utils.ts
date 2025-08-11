/**
 * PDF Utilities - Legacy compatibility layer
 */

import { generateQuotePdf, openPdfInNewTab } from '@/pdf/generateQuotePdf';
import { toast } from 'sonner';

export const generateAndDownloadPdf = async (
  template: any,
  inputs: Record<string, any>,
  filename?: string
) => {
  try {
    const pdf = await generateQuotePdf(template, inputs);
    openPdfInNewTab(pdf);
    return true;
  } catch (error: any) {
    console.error('PDF generation failed:', error);
    toast.error(`PDF generation failed: ${error.message}`);
    return false;
  }
};

export const generateSampleData = (template: any) => {
  const sampleData: Record<string, any> = {};
  
  if (template?.schemas?.[0]) {
    Object.keys(template.schemas[0]).forEach(fieldName => {
      const field = template.schemas[0][fieldName];
      const type = field?.type || 'text';
      
      const name = fieldName.toLowerCase();
      
      if (type === 'table') {
        sampleData[fieldName] = [
          ['Item', 'Qty', 'Price', 'Total'],
          ['Sample Item 1', '2', '$100.00', '$200.00']
        ];
      } else if (type === 'image') {
        sampleData[fieldName] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      } else {
        if (name.includes('company')) sampleData[fieldName] = 'Your Company Name';
        else if (name.includes('customer')) sampleData[fieldName] = 'Sample Customer';
        else if (name.includes('date')) sampleData[fieldName] = new Date().toLocaleDateString();
        else if (name.includes('total')) sampleData[fieldName] = '$1,250.00';
        else sampleData[fieldName] = `Sample ${fieldName}`;
      }
    });
  }
  
  return sampleData;
};