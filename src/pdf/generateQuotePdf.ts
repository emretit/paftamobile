/**
 * Quote PDF Generator
 * 
 * Handles PDF generation using pdfme with proper error handling and optimization.
 * Provides a clean wrapper around pdfme generator for quotation PDFs.
 */

import { generate } from '@pdfme/generator';
import { text, image, table } from '@pdfme/schemas';
import { BLANK_PDF } from '@pdfme/common';

export interface PdfOptions {
  filename?: string;
  openInNewTab?: boolean;
}

export const generateQuotePdf = async (
  template: any,
  inputs: Record<string, any>,
  options: PdfOptions = {}
) => {
  try {
    console.log('🚀 Generating PDF with template:', template);
    console.log('📊 Input data:', inputs);

    // Prepare template
    const preparedTemplate = JSON.parse(JSON.stringify(template));
    
    // Handle BLANK_PDF placeholder
    if (preparedTemplate.basePdf === 'BLANK_PDF') {
      preparedTemplate.basePdf = BLANK_PDF;
    }

    // Generate PDF
    const pdf = await generate({
      template: preparedTemplate,
      inputs: [inputs],
      plugins: {
        text,
        image,
        table,
      } as any,
    });

    console.log('✅ PDF generated successfully');
    return pdf;

  } catch (error: any) {
    console.error('❌ PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

export const downloadPdf = (pdf: Uint8Array, filename = 'quotation.pdf') => {
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const openPdfInNewTab = (pdf: Uint8Array) => {
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  
  if (!newWindow) {
    // Fallback to download if popup blocked
    downloadPdf(pdf);
    throw new Error('Popup blocked - PDF downloaded instead');
  }
  
  // Clean up after 30 seconds
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  
  return newWindow;
};