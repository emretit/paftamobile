/**
 * Development PDF Preview Page
 * For testing PDF generation and export functionality
 */

import React from 'react';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuoteExportActions from '@/components/QuoteExportActions';

export default function PdfPreview(): JSX.Element {
  // Fixed quote ID for testing - replace with actual quote ID from your database
  const testQuoteId = 'test-quote-id-123';
  const testQuoteNumber = 'QUOTE-2024-001';

  return (
    <DefaultLayout 
      isCollapsed={false}
      setIsCollapsed={() => {}}
      title="PDF Preview Test"
      subtitle="Test the PDF generation and export functionality"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">PDF Preview Test</h1>
          <p className="text-muted-foreground">
            Test the PDF generation and export functionality
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quote PDF Export Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Test Quote</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Quote ID: {testQuoteId}
                <br />
                Quote Number: {testQuoteNumber}
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Public Storage Test</h4>
                  <QuoteExportActions 
                    quoteId={testQuoteId}
                    quoteNumber={testQuoteNumber}
                    isPrivateStorage={false}
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Private Storage Test</h4>
                  <QuoteExportActions 
                    quoteId={testQuoteId}
                    quoteNumber={testQuoteNumber}
                    isPrivateStorage={true}
                  />
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Note:</strong> This page uses demo data in development mode.</p>
              <p>Replace <code>testQuoteId</code> with a real quote ID from your database to test with actual data.</p>
              <p>Make sure you have created the 'documents' storage bucket in Supabase.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}