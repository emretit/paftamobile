/**
 * Blob New Tab Utility
 * 
 * Utility for opening blob data (especially PDFs) in new browser tabs.
 * Handles popup blocking gracefully with fallback options.
 */

export const openBlobInNewTab = (
  blob: Blob,
  filename?: string
): Window | null => {
  const url = URL.createObjectURL(blob);
  
  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      // Popup was blocked, try alternative approach
      console.warn('Popup blocked, attempting download fallback');
      
      if (filename) {
        // Create download link as fallback
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      return null;
    }
    
    // Clean up URL after 30 seconds
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000);
    
    return newWindow;
    
  } catch (error) {
    console.error('Error opening blob in new tab:', error);
    URL.revokeObjectURL(url);
    return null;
  }
};

export const createBlobFromBuffer = (
  buffer: ArrayBuffer | Uint8Array,
  mimeType = 'application/pdf'
): Blob => {
  return new Blob([buffer], { type: mimeType });
};

export const openPdfBuffer = (
  pdfBuffer: ArrayBuffer | Uint8Array,
  filename?: string
): Window | null => {
  const blob = createBlobFromBuffer(pdfBuffer, 'application/pdf');
  return openBlobInNewTab(blob, filename);
};