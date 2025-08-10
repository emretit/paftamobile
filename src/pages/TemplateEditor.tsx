import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const TemplateEditor: React.FC = () => {
  const designerRef = useRef<HTMLDivElement>(null);
  const [designer, setDesigner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>('PDF Şablonum');

  useEffect(() => {
    document.title = 'PDF Şablon Düzenleyici | Quotations';
    // SEO: meta description + canonical
    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = 'PDFMe ile teklif PDF şablonlarını düzenleyin ve kaydedin.';

    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.origin + '/settings/templates/pdfme';

    document.head.appendChild(metaDesc);
    document.head.appendChild(canonical);

    return () => {
      document.head.removeChild(metaDesc);
      document.head.removeChild(canonical);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userRes.user) {
          toast.error('Kullanıcı bilgisi alınamadı');
          setLoading(false);
          return;
        }
        const userId = userRes.user.id;

        // Load existing template
        const { data: tmpl, error: tmplErr } = await supabase
          .from('templates')
          .select('id, name, template_json')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { Designer } = await import('@pdfme/ui');
        const { text, image, barcodes } = await import('@pdfme/schemas');

        // Enhanced default template with better layout and more fields
        const defaultTemplate = {
          basePdf: { width: 210, height: 297, padding: 10 },
          schemas: [
            {
              // Header section
              companyName: {
                type: 'text',
                position: { x: 10, y: 15 },
                width: 190,
                height: 12,
                fontSize: 18,
                fontColor: '#1a1a1a',
                alignment: 'center',
                fontName: 'NotoSerifJP-Regular'
              },
              companyAddress: {
                type: 'text',
                position: { x: 10, y: 30 },
                width: 190,
                height: 8,
                fontSize: 10,
                fontColor: '#666666',
                alignment: 'center'
              },
              companyPhone: {
                type: 'text',
                position: { x: 10, y: 40 },
                width: 190,
                height: 8,
                fontSize: 10,
                fontColor: '#666666',
                alignment: 'center'
              },
              
              // Title section
              documentTitle: {
                type: 'text',
                position: { x: 10, y: 60 },
                width: 190,
                height: 12,
                fontSize: 16,
                fontColor: '#1a1a1a',
                alignment: 'center',
                fontName: 'NotoSerifJP-Regular'
              },
              
              // Document info
              quotationNumber: {
                type: 'text',
                position: { x: 140, y: 80 },
                width: 60,
                height: 8,
                fontSize: 10,
                fontColor: '#1a1a1a',
                alignment: 'left'
              },
              quotationDate: {
                type: 'text',
                position: { x: 140, y: 90 },
                width: 60,
                height: 8,
                fontSize: 10,
                fontColor: '#1a1a1a',
                alignment: 'left'
              },
              validUntil: {
                type: 'text',
                position: { x: 140, y: 100 },
                width: 60,
                height: 8,
                fontSize: 10,
                fontColor: '#1a1a1a',
                alignment: 'left'
              },
              
              // Customer info
              customerName: {
                type: 'text',
                position: { x: 10, y: 80 },
                width: 120,
                height: 10,
                fontSize: 12,
                fontColor: '#1a1a1a',
                fontName: 'NotoSerifJP-Regular'
              },
              customerAddress: {
                type: 'text',
                position: { x: 10, y: 92 },
                width: 120,
                height: 16,
                fontSize: 9,
                fontColor: '#666666',
                lineHeight: 1.4
              },
              
              // Items table header
              itemsHeader: {
                type: 'text',
                position: { x: 10, y: 120 },
                width: 190,
                height: 8,
                fontSize: 10,
                fontColor: '#ffffff',
                backgroundColor: '#333333',
                alignment: 'center'
              },
              
              // Total amount
              totalLabel: {
                type: 'text',
                position: { x: 130, y: 200 },
                width: 40,
                height: 10,
                fontSize: 12,
                fontColor: '#1a1a1a',
                alignment: 'right'
              },
              totalAmount: {
                type: 'text',
                position: { x: 175, y: 200 },
                width: 25,
                height: 10,
                fontSize: 12,
                fontColor: '#1a1a1a',
                alignment: 'right',
                fontName: 'NotoSerifJP-Regular'
              },
              
              // Footer
              paymentTerms: {
                type: 'text',
                position: { x: 10, y: 230 },
                width: 190,
                height: 20,
                fontSize: 9,
                fontColor: '#666666',
                lineHeight: 1.3
              },
              notes: {
                type: 'text',
                position: { x: 10, y: 255 },
                width: 190,
                height: 25,
                fontSize: 9,
                fontColor: '#666666',
                lineHeight: 1.3
              }
            }
          ]
        };

        if (designerRef.current) {
          const d = new Designer({
            domContainer: designerRef.current,
            template: tmpl?.template_json || defaultTemplate,
            plugins: { text, image, qrcode: barcodes.qrcode } as any,
            options: {
              theme: {
                token: {
                  colorPrimary: '#3b82f6',
                  borderRadius: 6,
                },
              },
              lang: 'en',
              labels: {
                // Customize labels if needed
              }
            }
          });
          setDesigner(d);
          setTemplateId(tmpl?.id || null);
          if (tmpl?.name) setTemplateName(tmpl.name);
        }
      } catch (e) {
        console.error('Designer init error', e);
        toast.error('PDF tasarımcısı yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (designer) designer.destroy?.();
    };
  }, []);

  const handleSave = async () => {
    try {
      if (!designer) return;
      const template = designer.getTemplate();

      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) {
        toast.error('Kullanıcı bulunamadı');
        return;
      }

      if (templateId) {
        const { error } = await supabase
          .from('templates')
          .update({ name: templateName, template_json: template })
          .eq('id', templateId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('templates')
          .insert({ name: templateName, template_json: template, user_id: userId })
          .select('id')
          .maybeSingle();
        if (error) throw error;
        setTemplateId(data?.id || null);
      }
      toast.success('Şablon kaydedildi');
    } catch (e) {
      console.error('Save template error', e);
      toast.error('Şablon kaydedilemedi');
    }
  };

  const handlePreview = async () => {
    try {
      if (!designer) return;
      const template = designer.getTemplate();

      // Enhanced mock inputs for preview
      const inputs = {
        companyName: 'ABC Teknoloji Ltd. Şti.',
        companyAddress: 'Merkez Mah. Teknoloji Cad. No:123 Şişli/İstanbul',
        companyPhone: 'Tel: (212) 555-0123 | Email: info@abcteknoloji.com',
        documentTitle: 'TEKLİF BELGESİ',
        quotationNumber: 'TKL-2025-001',
        quotationDate: new Date().toLocaleDateString('tr-TR'),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
        customerName: 'XYZ İnşaat A.Ş.',
        customerAddress: 'Sanayi Mah. İnşaat Cad. No:456\nKadıköy/İstanbul\nVergi No: 1234567890',
        itemsHeader: 'ÜRÜN/HİZMET DETAYLARI',
        totalLabel: 'TOPLAM:',
        totalAmount: '125.000,00 ₺',
        paymentTerms: 'Ödeme Koşulları: 30 gün vadeli, %2 peşin indirimi uygulanır.',
        notes: 'Bu teklif 30 gün geçerlidir. Tüm fiyatlar KDV dahildir. Teslimat süresi sipariş onayından sonra 15 iş günüdür.'
      };

      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes } = await import('@pdfme/schemas');
      const pdf = await generate({ template, inputs: [inputs], plugins: { text, image, qrcode: barcodes.qrcode } as any });

      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error('Preview error', e);
      toast.error('Önizleme oluşturulamadı');
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">PDF tasarımcısı yükleniyor...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">PDF Şablon Düzenleyici</h1>
        <div className="flex items-center gap-2">
          <Input className="h-9 w-[260px]" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
          <Button variant="outline" onClick={handlePreview}>Önizleme</Button>
          <Button onClick={handleSave}>Kaydet</Button>
        </div>
      </div>

      <Card className="p-4">
        <div ref={designerRef} className="w-full h-[600px] border border-border rounded-md bg-background" />
      </Card>
    </div>
  );
};

export default TemplateEditor;
