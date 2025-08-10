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

        const defaultTemplate = {
          basePdf: { width: 210, height: 297 },
          schemas: [[{
            companyName: {
              type: 'text', position: { x: 20, y: 20 }, width: 100, height: 10, fontSize: 16, fontColor: '#000000'
            },
            quotationTitle: {
              type: 'text', position: { x: 20, y: 40 }, width: 170, height: 10, fontSize: 14, fontColor: '#000000'
            },
            customerName: {
              type: 'text', position: { x: 20, y: 60 }, width: 100, height: 8, fontSize: 12, fontColor: '#000000'
            },
            totalAmount: {
              type: 'text', position: { x: 20, y: 80 }, width: 100, height: 8, fontSize: 12, fontColor: '#000000'
            }
          }]]
        };

        if (designerRef.current) {
          const d = new Designer({
            domContainer: designerRef.current,
            template: tmpl?.template_json || defaultTemplate,
            plugins: { text, image, qrcode: barcodes.qrcode } as any,
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

      // Simple mock inputs for quick preview
      const inputs = {
        companyName: 'Şirket A.Ş.',
        quotationTitle: 'Teklif Başlığı',
        customerName: 'Müşteri Adı',
        totalAmount: '25.000 ₺',
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
