import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TemplateDesignSettings } from '@/types/proposal-template';
import { PDFMeTemplateDesigner } from './template-designer/PDFMeTemplateDesigner';
import { pdfmeGenerator } from '@/utils/pdfmeGenerator';

import { toast } from 'sonner';

export const VisualTemplateManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [initialTemplate, setInitialTemplate] = useState<any | null>(null);
  const [templateName, setTemplateName] = useState<string>('Yeni Şablon');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Try active, then latest
      const { data: active, error: activeError } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!activeError && active?.pdfme_template) {
        setInitialTemplate(active.pdfme_template);
        if (active.name) setTemplateName(active.name);
        setLoading(false);
        return;
      }

      const { data: latest } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setInitialTemplate(latest?.pdfme_template || null);
      if (latest?.name) setTemplateName(latest.name);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (template: any) => {
    try {
      // Ensure one active template. If an active exists, update it; else insert new as active
      const { data: active } = await supabase
        .from('proposal_templates')
        .select('id')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (active?.id) {
        const { error: updErr } = await supabase
          .from('proposal_templates')
          .update({ pdfme_template: template, is_active: true, name: templateName, description: 'PDFMe editörü ile oluşturuldu' })
          .eq('id', active.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from('proposal_templates')
          .insert({
            name: templateName,
            description: 'PDFMe editörü ile oluşturuldu',
            template_type: 'custom',
            template_features: ['pdfme', 'drag', 'resize', 'professional'],
            pdfme_template: template,
            is_active: true,
          });
        if (insErr) throw insErr;
      }
      toast.success('Aktif şablon güncellendi');
    } catch (e: any) {
      // Column may not exist yet or RLS may block; try without is_active
      const message = String(e?.message || e);
      if (message.includes('is_active')) {
        const { error } = await supabase
          .from('proposal_templates')
          .insert({
            name: templateName,
            description: 'PDFMe editörü ile oluşturuldu',
            template_type: 'custom',
            template_features: ['pdfme', 'drag', 'resize', 'professional'],
            pdfme_template: template,
          });
        if (error) throw error;
        toast.warning('Şablon kaydedildi ancak aktif olarak işaretlenemedi. Yetkileri kontrol edin.');
      } else {
        toast.error('Şablon kaydedilemedi');
        throw e;
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-6">Yükleniyor...</Card>
    );
  }

  const handlePreview = async (template: any) => {
    await pdfmeGenerator.generatePreviewPDF(template);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Teklif Şablonu Tasarımcısı</h2>
          <input
            className="h-9 px-3 border rounded text-sm"
            placeholder="Şablon adı"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>
        <Button onClick={async () => initialTemplate && (await handleSave(initialTemplate))}>Kaydet</Button>
      </div>

      <PDFMeTemplateDesigner 
        initialTemplate={initialTemplate} 
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </div>
  );
};

export default VisualTemplateManager;
