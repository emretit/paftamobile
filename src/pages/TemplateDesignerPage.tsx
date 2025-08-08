import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TemplateDesignSettings } from '@/types/proposal-template';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateVisualEditor } from '@/components/settings/template-designer/TemplateVisualEditor';

export const TemplateDesignerPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState<TemplateDesignSettings | null>(null);
  const [name, setName] = useState<string>('Yeni Şablon');

  useEffect(() => {
    const load = async () => {
      if (!id) { setLoading(false); return; }
      const { data } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        setDesign(data.design_settings as TemplateDesignSettings);
        setName(data.name || '');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSave = async (d: TemplateDesignSettings) => {
    if (id) {
      await supabase.from('proposal_templates').update({ name, design_settings: d }).eq('id', id);
    } else {
      const { data } = await supabase.from('proposal_templates').insert({ name, design_settings: d }).select('id').single();
      if (data?.id) navigate(`/settings/templates/${data.id}/edit`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={false} setIsCollapsed={() => {}} />
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Şablon Tasarım</h1>
              <input className="h-9 px-3 border rounded text-sm" placeholder="Şablon adı" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate('/settings')}>Geri</Button>
              <Button onClick={() => design && handleSave(design)}>Kaydet</Button>
            </div>
          </div>

          <Card className="p-0">
            {!loading && (
              <TemplateVisualEditor initialDesign={design} onSave={(d) => { setDesign(d); return handleSave(d); }} />
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TemplateDesignerPage;

