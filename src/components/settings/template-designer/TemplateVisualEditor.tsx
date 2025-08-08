import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  SelectionDrag,
  Panel,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SectionNode, { SectionKind, SectionNodeData } from './SectionNode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TemplateDesignSettings, TemplateSection } from '@/types/proposal-template';

const nodeTypes = { section: SectionNode } as const;

type EditorProps = {
  initialDesign?: TemplateDesignSettings | null;
  onSave: (design: TemplateDesignSettings) => Promise<void> | void;
};

const defaultNodes: Node<SectionNodeData>[] = [
  { id: 'header', type: 'section', position: { x: 40, y: 24 }, data: { label: 'Başlık / Firma', kind: 'header', text: 'Şirket Adı\nTagline' }, style: { width: 520, height: 80 } },
  { id: 'logo', type: 'section', position: { x: 570, y: 24 }, data: { label: 'Logo', kind: 'logo', imageUrl: '' }, style: { width: 120, height: 80 } },
  { id: 'customer', type: 'section', position: { x: 40, y: 120 }, data: { label: 'Müşteri Bilgileri', kind: 'customer', text: 'Müşteri Adı\nAdres\nVergi No' }, style: { width: 320, height: 120 } },
  { id: 'proposal', type: 'section', position: { x: 380, y: 120 }, data: { label: 'Teklif Bilgileri', kind: 'proposal', text: 'Teklif No\nTarih\nGeçerlilik' }, style: { width: 310, height: 120 } },
  { id: 'items', type: 'section', position: { x: 40, y: 260 }, data: { label: 'Kalemler (Tablo Alanı)', kind: 'items', text: 'Ürün/Servis tablosu burada yer alır.' }, style: { width: 650, height: 280 } },
  { id: 'totals', type: 'section', position: { x: 40, y: 560 }, data: { label: 'Ara Toplam / KDV / Genel Toplam', kind: 'totals', text: 'Ara Toplam: 0,00\nKDV: 0,00\nGenel Toplam: 0,00' }, style: { width: 300, height: 100 } },
  { id: 'terms', type: 'section', position: { x: 360, y: 560 }, data: { label: 'Şartlar / Notlar', kind: 'terms', text: 'Ödeme şartları ve diğer notlar.' }, style: { width: 330, height: 100 } },
  { id: 'footer', type: 'section', position: { x: 40, y: 680 }, data: { label: 'Alt Bilgi', kind: 'footer', text: 'Adres • Telefon • Web' }, style: { width: 650, height: 60 } },
];

function nodesFromDesign(design?: TemplateDesignSettings | null): Node<SectionNodeData>[] {
  if (!design?.sections?.length) return defaultNodes;
  return design.sections.map((s, idx) => {
    const x = s.settings?.x ?? 40 + (idx % 2) * 340;
    const y = s.settings?.y ?? 24 + idx * 60;
    const width = s.settings?.width ?? 300;
    const height = s.settings?.height ?? 80;
    const kind: SectionKind = (s.settings?.kind as SectionKind) || 'text';
    return {
      id: s.id,
      type: 'section',
      position: { x, y },
      data: {
        label: s.title,
        kind,
        text: s.settings?.text,
        imageUrl: s.settings?.imageUrl,
      },
      style: { width, height },
    } as Node<SectionNodeData>;
  });
}

function designFromNodes(nodes: Node<SectionNodeData>[]): TemplateDesignSettings {
  const sections: TemplateSection[] = nodes.map((n, i) => ({
    id: n.id,
    type: 'custom',
    title: n.data.label,
    enabled: true,
    order: i,
    settings: {
      kind: n.data.kind,
      text: n.data.text,
      imageUrl: n.data.imageUrl,
      x: n.position.x,
      y: n.position.y,
      width: (n.style as any)?.width ?? 300,
      height: (n.style as any)?.height ?? 80,
    },
  }));

  return {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 24, bottom: 24, left: 24, right: 24 },
    header: { enabled: true, height: 80, logoPosition: 'right', logoSize: 'medium', showCompanyInfo: true, backgroundColor: '#ffffff', textColor: '#111111' },
    footer: { enabled: true, height: 60, showPageNumbers: false, showContactInfo: true, backgroundColor: '#ffffff', textColor: '#111111' },
    colors: { primary: '#111111', secondary: '#666666', accent: '#0ea5e9', text: '#111111', background: '#ffffff', border: '#e5e7eb' },
    fonts: { primary: 'Helvetica', secondary: 'Helvetica', sizes: { title: 18, heading: 14, body: 11, small: 9 } },
    table: { headerBackground: '#f5f5f5', headerText: '#111111', rowAlternating: true, borderColor: '#e5e7eb', borderWidth: 1 },
    layout: { spacing: 'normal', showBorders: true, roundedCorners: true, shadowEnabled: false },
    branding: { companyName: 'Şirket Adı' },
    sections,
  };
}

export const TemplateVisualEditor: React.FC<EditorProps> = ({ initialDesign, onSave }) => {
  const initialNodes = useMemo(() => nodesFromDesign(initialDesign), [initialDesign]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<SectionNodeData>>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);
  const [selected, setSelected] = useState<Node<SectionNodeData> | null>(null);

  useEffect(() => {
    setNodes(nodesFromDesign(initialDesign));
  }, [initialDesign, setNodes]);

  const onSelectionChange = useCallback(({ nodes: selNodes }: { nodes: Node[] }) => {
    setSelected((selNodes?.[0] as Node<SectionNodeData>) || null);
  }, []);

  const updateSelected = (patch: Partial<SectionNodeData>) => {
    if (!selected) return;
    setNodes((nds) =>
      nds.map((n) => (n.id === selected.id ? { ...n, data: { ...n.data, ...patch } } as Node<SectionNodeData> : n))
    );
  };

  const handleSave = async () => {
    const design = designFromNodes(nodes);
    await onSave(design);
    toast.success('Şablon kaydedildi ve etkinleştirildi');
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card className="col-span-9 p-3">
        <div className="relative border border-border rounded-md overflow-hidden" aria-label="PDF A4 Canvas">
          <div className="mx-auto my-2 bg-background" style={{ width: 744, height: 1052 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onSelectionChange={onSelectionChange}
              fitView
              nodeTypes={nodeTypes}
              proOptions={{ hideAttribution: true }}
              style={{ backgroundColor: 'transparent' }}
            >
              <Background />
              <SelectionDrag />
              <Controls />
              <MiniMap />
              <Panel position="top-right">
                <Button size="sm" onClick={handleSave}>Kaydet ve Etkinleştir</Button>
              </Panel>
            </ReactFlow>
          </div>
        </div>
      </Card>

      <Card className="col-span-3 p-4 space-y-4">
        <div>
          <div className="text-sm font-semibold mb-3">Seçili Alan Özellikleri</div>
          {selected ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Başlık</Label>
                <Input value={selected.data.label} onChange={(e) => updateSelected({ label: e.target.value })} />
              </div>
              {selected.data.kind === 'logo' ? (
                <div>
                  <Label className="text-xs">Logo URL</Label>
                  <Input
                    placeholder="https://..."
                    value={selected.data.imageUrl || ''}
                    onChange={(e) => updateSelected({ imageUrl: e.target.value })}
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-xs">Metin</Label>
                  <Input
                    value={selected.data.text || ''}
                    onChange={(e) => updateSelected({ text: e.target.value })}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs opacity-70">Bir alan seçin ve özelliklerini düzenleyin.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TemplateVisualEditor;
