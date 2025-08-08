import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TemplateDesignSettings } from '@/types/proposal-template';
import { TemplateVisualEditor } from './template-designer/TemplateVisualEditor';
import { toast } from 'sonner';
import { TemplatePreview } from './template-designer/TemplatePreview';

export const VisualTemplateManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [initialDesign, setInitialDesign] = useState<TemplateDesignSettings | null>(null);

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

      if (!activeError && active?.design_settings) {
        setInitialDesign(active.design_settings as TemplateDesignSettings);
        setLoading(false);
        return;
      }

      const { data: latest } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setInitialDesign((latest?.design_settings as TemplateDesignSettings) || null);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (design: TemplateDesignSettings) => {
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
          .update({ design_settings: design, is_active: true, name: 'Özel Şablon', description: 'Görsel editör ile oluşturuldu' })
          .eq('id', active.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from('proposal_templates')
          .insert({
            name: 'Özel Şablon',
            description: 'Görsel editör ile oluşturuldu',
            template_type: 'custom',
            template_features: ['drag', 'resize', 'branding'],
            design_settings: design,
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
            name: 'Özel Şablon',
            description: 'Görsel editör ile oluşturuldu',
            template_type: 'custom',
            template_features: ['drag', 'resize', 'branding'],
            design_settings: design,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Teklif Şablonu Tasarımcısı</h2>
          <p className="text-sm opacity-70">Önceden tanımlı düzeni sürükle-bırak ile konumlandırın, metin ve logo düzenleyin.</p>
        </div>
        <Button onClick={async () => initialDesign && (await handleSave(initialDesign))} variant="secondary">Varsayılanı Etkinleştir</Button>
      </div>

      {/* Önizleme + Editor yan yana */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-5 p-3">
          <div className="text-sm font-medium mb-2">Canlı Önizleme</div>
          {/* Random verili preview */}
          {initialDesign ? (
            <TemplatePreview 
              template={{ id: 'preview', name: 'Önizleme', description: '', templateType: 'standard', templateFeatures: [], items: [], designSettings: initialDesign }}
              designSettings={initialDesign}
            />
          ) : (
            <Card className="p-6">Önizleme için veri yükleniyor…</Card>
          )}
        </Card>
        <div className="col-span-7">
          <TemplateVisualEditor initialDesign={initialDesign} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default VisualTemplateManager;
