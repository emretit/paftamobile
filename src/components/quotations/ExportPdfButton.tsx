import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ExportPdfButtonProps {
  quotationId: string;
  label?: string;
  quotationData?: any; // Quotation data to use instead of fetching
}

// Helper to safely get nested values like "customer.name" from an object
const getNested = (obj: any, path: string) =>
  path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

const buildInputsFromTemplate = (template: any, quotation: Record<string, any>) => {
  const inputs: Record<string, any> = {};
  const schema = template?.schemas?.[0] || {};

  // Enhanced field mappings with fallbacks
  const fieldMappings: Record<string, any> = {
    // Company info
    companyName: quotation.company_name || 'Şirket Adı',
    companyAddress: quotation.company_address || 'Şirket Adresi',
    companyPhone: quotation.company_phone || 'Tel: (0212) 555-0000',
    
    // Document info
    documentTitle: 'TEKLİF BELGESİ',
    quotationTitle: quotation.title || 'Teklif Başlığı',
    quotationNumber: quotation.proposal_number || quotation.id?.slice(0, 8) || 'TKL-001',
    quotationDate: quotation.created_at ? new Date(quotation.created_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
    validUntil: quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString('tr-TR') : '',
    
    // Customer info
    customerName: quotation.customer_name || 'Müşteri Adı',
    customerAddress: quotation.customer_address || 'Müşteri Adresi',
    
    // Items
    itemsHeader: 'ÜRÜN/HİZMET DETAYLARI',
    
    // Financial
    totalLabel: 'TOPLAM:',
    totalAmount: quotation.total_amount ? `${quotation.total_amount.toLocaleString('tr-TR')} ₺` : '0,00 ₺',
    
    // Terms
    paymentTerms: quotation.payment_terms || 'Ödeme koşulları belirtilmemiş.',
    notes: quotation.notes || 'Ek notlar bulunmamaktadır.'
  };

  Object.keys(schema).forEach((key) => {
    // Use enhanced mapping first, then fallback to direct/nested access
    if (fieldMappings.hasOwnProperty(key)) {
      inputs[key] = fieldMappings[key];
    } else {
      const direct = quotation?.[key];
      const nested = getNested(quotation, key);
      const val = nested ?? direct ?? '';

      // Basic formatting for common types
      if (val instanceof Date) {
        inputs[key] = new Date(val).toLocaleDateString('tr-TR');
      } else if (typeof val === 'number') {
        inputs[key] = val.toLocaleString('tr-TR');
      } else {
        inputs[key] = String(val);
      }
    }
  });

  return inputs;
};

export const ExportPdfButton: React.FC<ExportPdfButtonProps> = ({ quotationId, label = 'PDF Dışa Aktar' }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      // 1) Current user
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        toast.error('Kullanıcı bilgisi alınamadı');
        return;
      }
      const userId = userRes.user.id;

      // 2) Load user's template JSON
      const { data: tmpl, error: tmplErr } = await supabase
        .from('templates')
        .select('id, name, template_json')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tmplErr) throw tmplErr;
      if (!tmpl || !tmpl.template_json) {
        toast.error('Kullanıcıya ait bir şablon bulunamadı');
        return;
      }

      // 3) Fetch quotation data
      const { data: quotation, error: qErr } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', quotationId)
        .maybeSingle();

      if (qErr) throw qErr;
      if (!quotation) {
        toast.error('Teklif verisi bulunamadı');
        return;
      }

      // 4) Generate pdfme inputs
      const inputs = buildInputsFromTemplate(tmpl.template_json, quotation);

      // 5) Generate PDF with pdfme
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes } = await import('@pdfme/schemas');

      const pdf = await generate({
        template: tmpl.template_json,
        inputs: [inputs],
        plugins: { text, image, qrcode: barcodes.qrcode } as any,
      });

      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // 6) Open in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');

      // Revoke later
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err: any) {
      console.error('PDF export error:', err);
      toast.error('PDF oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={loading} aria-busy={loading} size="sm">
      <FileDown className="h-4 w-4 mr-2" />
      {loading ? 'PDF Hazırlanıyor...' : label}
    </Button>
  );
};

export default ExportPdfButton;
