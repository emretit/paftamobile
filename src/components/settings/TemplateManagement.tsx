import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface TemplateRow {
  id: string;
  name: string;
  updated_at: string;
}

export const TemplateManagement: React.FC = () => {
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('proposal_templates')
        .select('id,name,updated_at')
        .order('updated_at', { ascending: false });
      setRows((data as any) || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from('proposal_templates').delete().eq('id', id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Şablonlar</h2>
        <Button onClick={() => navigate('/settings/templates/new')}>Yeni Şablon</Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left p-3">Ad</th>
              <th className="text-left p-3">Güncellendi</th>
              <th className="text-right p-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4" colSpan={3}>Yükleniyor…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-4" colSpan={3}>Henüz şablon yok.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{new Date(r.updated_at).toLocaleString('tr-TR')}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/settings/templates/${r.id}/edit`)}>Düzenle</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)}>Sil</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
