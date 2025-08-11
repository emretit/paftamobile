/**
 * Quote Export Actions Component
 * Provides PDF download and storage upload functionality
 */

import React, { useState } from 'react';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { Download, Upload, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { fetchQuote } from '@/hooks/useQuote';
import QuotationPDF from '@/pdf/QuotationPDF';
import type { Quote } from '@/types/quote';

interface QuoteExportActionsProps {
  quoteId: string;
  quoteNumber: string;
  isPrivateStorage?: boolean;
}

export default function QuoteExportActions({ 
  quoteId, 
  quoteNumber, 
  isPrivateStorage = false 
}: QuoteExportActionsProps): JSX.Element {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load quote data
  const loadQuote = async () => {
    if (quote || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const quoteData = await fetchQuote(quoteId);
      setQuote(quoteData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quote';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload PDF to storage
  const handleUploadToStorage = async () => {
    if (!quote) {
      await loadQuote();
      if (!quote) return;
    }

    setIsUploading(true);
    
    try {
      // Generate PDF blob
      const blob = await pdf(<QuotationPDF quote={quote} />).toBlob();
      
      // Upload to Supabase storage
      const fileName = `quotes/${quoteNumber}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get URL based on privacy setting
      let publicUrl: string;
      
      if (isPrivateStorage) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from('documents')
          .createSignedUrl(fileName, 3600); // 1 hour expiry

        if (signedError) {
          throw new Error(`Failed to create signed URL: ${signedError.message}`);
        }
        
        publicUrl = signedData.signedUrl;
      } else {
        const { data: publicData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
        
        publicUrl = publicData.publicUrl;
      }

      setUploadedUrl(publicUrl);
      toast.success('PDF uploaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize quote loading on first render
  React.useEffect(() => {
    loadQuote();
  }, [quoteId]);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm">
        <span>Error loading quote</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span>Quote not available</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      {/* PDF Download Button */}
      <PDFDownloadLink
        document={<QuotationPDF quote={quote} />}
        fileName={`Quotation-${quoteNumber}.pdf`}
      >
        {({ loading }) => (
          <Button 
            variant="outline" 
            size="sm" 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF İndir
          </Button>
        )}
      </PDFDownloadLink>

      {/* Storage Upload Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleUploadToStorage}
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Storage'a Yükle
      </Button>

      {/* Open PDF Link */}
      {uploadedUrl && (
        <a
          href={uploadedUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          PDF'i Aç
        </a>
      )}
    </div>
  );
}