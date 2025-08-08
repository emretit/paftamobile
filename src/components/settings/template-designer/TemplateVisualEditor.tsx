import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
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
import { Grid as GridIcon, Magnet, ZoomIn, ZoomOut } from 'lucide-react';

const nodeTypes = { section: SectionNode } as any;

type EditorProps = {
  initialDesign?: TemplateDesignSettings | null;
  onSave: (design: TemplateDesignSettings) => Promise<void> | void;
};

const defaultNodes: Node[] = [
  { id: 'header', type: 'section', position: { x: 40, y: 24 }, data: { label: 'Başlık / Firma', kind: 'header', text: 'Şirket Adı\nTagline' }, style: { width: 520, height: 80 } },
  { id: 'logo', type: 'section', position: { x: 570, y: 24 }, data: { label: 'Logo', kind: 'logo', imageUrl: '' }, style: { width: 120, height: 80 } },
  { id: 'customer', type: 'section', position: { x: 40, y: 120 }, data: { label: 'Müşteri Bilgileri', kind: 'customer', text: 'Müşteri Adı\nAdres\nVergi No' }, style: { width: 320, height: 120 } },
  { id: 'proposal', type: 'section', position: { x: 380, y: 120 }, data: { label: 'Teklif Bilgileri', kind: 'proposal', text: 'Teklif No\nTarih\nGeçerlilik' }, style: { width: 310, height: 120 } },
  { id: 'items', type: 'section', position: { x: 40, y: 260 }, data: { label: 'Kalemler (Tablo Alanı)', kind: 'items', text: 'Ürün/Servis tablosu burada yer alır.' }, style: { width: 650, height: 280 } },
  { id: 'totals', type: 'section', position: { x: 40, y: 560 }, data: { label: 'Ara Toplam / KDV / Genel Toplam', kind: 'totals', text: 'Ara Toplam: 0,00\nKDV: 0,00\nGenel Toplam: 0,00' }, style: { width: 300, height: 100 } },
  { id: 'terms', type: 'section', position: { x: 360, y: 560 }, data: { label: 'Şartlar / Notlar', kind: 'terms', text: 'Ödeme şartları ve diğer notlar.' }, style: { width: 330, height: 100 } },
  { id: 'footer', type: 'section', position: { x: 40, y: 680 }, data: { label: 'Alt Bilgi', kind: 'footer', text: 'Adres • Telefon • Web' }, style: { width: 650, height: 60 } },
];

function nodesFromDesign(design?: TemplateDesignSettings | null): Node[] {
  if (!design?.sections?.length) return defaultNodes;
  return design.sections.map((s, idx) => {
    const x = s.settings?.x ?? 40 + (idx % 2) * 340;
    const y = s.settings?.y ?? 24 + idx * 60;
    const width = s.settings?.width ?? 300;
    const height = s.settings?.height ?? 80;
    const kind = (s.settings?.kind as string) || 'text';
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
    } as Node;
  });
}

function designFromNodes(nodes: Node[]): TemplateDesignSettings {
  const sections: TemplateSection[] = nodes.map((n, i) => {
    const d = n.data as any;
    return {
      id: n.id,
      type: 'custom',
      title: d.label,
      enabled: true,
      order: i,
      settings: {
        kind: d.kind,
        text: d.text,
        imageUrl: d.imageUrl,
        x: n.position.x,
        y: n.position.y,
        width: (n.style as any)?.width ?? 300,
        height: (n.style as any)?.height ?? 80,
      },
    };
  });

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
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);
  const [selected, setSelected] = useState<Node | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [smartGuides, setSmartGuides] = useState(true);
  const [gridSize, setGridSize] = useState<number>(10);
  const [guides, setGuides] = useState<Array<{ type: 'v'; x: number; y1: number; y2: number } | { type: 'h'; y: number; x1: number; x2: number }>>([]);

  useEffect(() => {
    setNodes(nodesFromDesign(initialDesign));
  }, [initialDesign, setNodes]);

  const onSelectionChange = useCallback(({ nodes: selNodes }: { nodes: Node[] }) => {
    setSelected(selNodes?.[0] || null);
  }, []);

  const updateSelected = (patch: Partial<any>) => {
    if (!selected) return;
    setNodes((nds) => nds.map((n) => (n.id === selected.id ? ({ ...n, data: { ...(n.data as any), ...patch } } as Node) : n)));
  };

  const handleSave = async () => {
    const design = designFromNodes(nodes);
    await onSave(design);
    toast.success('Şablon kaydedildi ve etkinleştirildi');
  };

  // Smart guides helpers
  const PAGE_W = 744;
  const PAGE_H = 1052;
  const SNAP_THRESHOLD = 6;

  const getRects = useCallback(() => {
    return nodes.map((n) => {
      const style = (n.style as any) || {};
      const w = Number(style.width) || 300;
      const h = Number(style.height) || 80;
      return {
        id: n.id,
        x: n.position.x,
        y: n.position.y,
        w,
        h,
        cx: n.position.x + w / 2,
        cy: n.position.y + h / 2,
      };
    });
  }, [nodes]);

  const computeSmartSnap = useCallback(
    (nodeId: string, x: number, y: number) => {
      const rects = getRects();
      const me = rects.find((r) => r.id === nodeId);
      if (!me) return { x, y, guides: [] as typeof guides };

      const candidatesV: number[] = [0, PAGE_W / 2, PAGE_W];
      const candidatesH: number[] = [0, PAGE_H / 2, PAGE_H];
      rects.forEach((r) => {
        if (r.id === nodeId) return;
        candidatesV.push(r.x, r.x + r.w, r.cx);
        candidatesH.push(r.y, r.y + r.h, r.cy);
      });

      let nx = x;
      let ny = y;
      const g: typeof guides = [];

      // snap left/top edges
      for (const vx of candidatesV) {
        if (Math.abs(nx - vx) <= SNAP_THRESHOLD) {
          nx = vx;
          g.push({ type: 'v', x: vx, y1: 0, y2: PAGE_H });
          break;
        }
      }
      for (const hy of candidatesH) {
        if (Math.abs(ny - hy) <= SNAP_THRESHOLD) {
          ny = hy;
          g.push({ type: 'h', y: hy, x1: 0, x2: PAGE_W });
          break;
        }
      }

      // center snapping
      const w = me.w;
      const h = me.h;
      const cx = nx + w / 2;
      const cy = ny + h / 2;
      for (const vx of candidatesV) {
        if (Math.abs(cx - vx) <= SNAP_THRESHOLD) {
          nx = vx - w / 2;
          g.push({ type: 'v', x: vx, y1: 0, y2: PAGE_H });
          break;
        }
      }
      for (const hy of candidatesH) {
        if (Math.abs(cy - hy) <= SNAP_THRESHOLD) {
          ny = hy - h / 2;
          g.push({ type: 'h', y: hy, x1: 0, x2: PAGE_W });
          break;
        }
      }

      return { x: nx, y: ny, guides: g };
    },
    [getRects]
  );

  const onNodeDrag = useCallback((_: any, node: Node) => {
    if (!smartGuides) return;
    const { guides: g } = computeSmartSnap(node.id, node.position.x, node.position.y);
    setGuides(g);
  }, [smartGuides, computeSmartSnap]);

  const onNodeDragStop = useCallback((_: any, node: Node) => {
    setGuides([]);
    let x = node.position.x;
    let y = node.position.y;
    if (smartGuides) {
      const res = computeSmartSnap(node.id, x, y);
      x = res.x; y = res.y;
    }
    if (snapToGrid && gridSize > 0) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    const id = node.id;
    setNodes((nds) => nds.map((n) => (n.id === id ? ({ ...n, position: { x, y } } as Node) : n)));
  }, [smartGuides, snapToGrid, gridSize, setNodes, computeSmartSnap]);

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
              snapToGrid={snapToGrid}
              snapGrid={[gridSize, gridSize]}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
            >
              {showGrid && <Background gap={gridSize} size={1} color="#e5e7eb" />}
              <Controls />
              {/* Smart guide lines */}
              {smartGuides && guides.map((g, i) => (
                g.type === 'v' ? (
                  <div key={`gv-${i}`} className="absolute bg-blue-500/60" style={{ left: g.x, top: g.y1, width: 1, height: g.y2 - g.y1 }} />
                ) : (
                  <div key={`gh-${i}`} className="absolute bg-blue-500/60" style={{ top: g.y, left: g.x1, height: 1, width: g.x2 - g.x1 }} />
                )
              ))}
              <MiniMap />
              <Panel position="top-right">
                <Button size="sm" onClick={handleSave}>Kaydet ve Etkinleştir</Button>
              </Panel>
              <Panel position="top-left" className="space-x-2">
                <Button variant={showGrid ? 'default' : 'outline'} size="sm" onClick={() => setShowGrid(v => !v)}>
                  <GridIcon className="w-4 h-4 mr-1" /> Izgara
                </Button>
                <Button variant={snapToGrid ? 'default' : 'outline'} size="sm" onClick={() => setSnapToGrid(v => !v)}>
                  <Magnet className="w-4 h-4 mr-1" /> Grid Snap
                </Button>
                <Button variant={smartGuides ? 'default' : 'outline'} size="sm" onClick={() => setSmartGuides(v => !v)}>
                  <Magnet className="w-4 h-4 mr-1" /> Akıllı Kılavuz
                </Button>
                <span className="text-xs ml-2">Grid:</span>
                <Input type="number" className="h-8 w-16 inline-block" min={2} max={64} value={gridSize} onChange={(e) => setGridSize(Math.max(2, Math.min(64, Number(e.target.value) || 10)))} />
                <span className="text-xs">px</span>
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
                <Input value={(selected.data as any).label as string} onChange={(e) => updateSelected({ label: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Metin Boyutu</Label>
                  <Input type="number" min={9} max={24} value={(selected.data as any).style?.fontSize ?? 12} onChange={(e) => updateSelected({ style: { ...((selected.data as any).style || {}), fontSize: Number(e.target.value) } })} />
                </div>
                <div>
                  <Label className="text-xs">Padding</Label>
                  <Input type="number" min={4} max={24} value={(selected.data as any).style?.padding ?? 12} onChange={(e) => updateSelected({ style: { ...((selected.data as any).style || {}), padding: Number(e.target.value) } })} />
                </div>
                <div>
                  <Label className="text-xs">Köşe Yarıçapı</Label>
                  <Input type="number" min={0} max={24} value={(selected.data as any).style?.radius ?? 8} onChange={(e) => updateSelected({ style: { ...((selected.data as any).style || {}), radius: Number(e.target.value) } })} />
                </div>
                <div>
                  <Label className="text-xs">Kenarlık (px)</Label>
                  <Input type="number" min={0} max={4} value={(selected.data as any).style?.borderWidth ?? 1} onChange={(e) => updateSelected({ style: { ...((selected.data as any).style || {}), borderWidth: Number(e.target.value) } })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Arka Plan</Label>
                  <Input type="color" value={(selected.data as any).style?.bgColor ?? '#ffffff'} onChange={(e) => updateSelected({ style: { ...((selected.data as any).style || {}), bgColor: e.target.value } })} />
                </div>
                <div>
                  <Label className="text-xs">Kenarlık Rengi</Label>
                  <Input type="color" value={(selected.data as any).style?.borderColor ?? '#e5e7eb'} onChange={(e) => updateSelected({ style: { ...((selected.data as any).style || {}), borderColor: e.target.value } })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Hizalama</Label>
                  <select className="w-full h-9 rounded border px-2 text-xs" value={(selected.data as any).style?.align ?? 'left'} onChange={(e) => updateSelected({ style: { ...((selected.data as any).style || {}), align: e.target.value } })}>
                    <option value="left">Sol</option>
                    <option value="center">Orta</option>
                    <option value="right">Sağ</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Kalınlık</Label>
                  <select className="w-full h-9 rounded border px-2 text-xs" value={(selected.data as any).style?.fontWeight ?? 'normal'} onChange={(e) => updateSelected({ style: { ...((selected.data as any).style || {}), fontWeight: e.target.value } })}>
                    <option value="normal">Normal</option>
                    <option value="bold">Kalın</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <input id="showLabel" type="checkbox" className="h-4 w-4" checked={(selected.data as any).style?.showLabel ?? true} onChange={(e) => updateSelected({ style: { ...((selected.data as any).style || {}), showLabel: e.target.checked } })} />
                  <Label htmlFor="showLabel" className="text-xs">Başlığı Göster</Label>
                </div>
              </div>
              {(selected.data as any).kind === 'logo' ? (
                <div>
                  <Label className="text-xs">Logo URL</Label>
                  <Input
                    placeholder="https://..."
                    value={((selected.data as any).imageUrl as string) || ''}
                    onChange={(e) => updateSelected({ imageUrl: e.target.value })}
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-xs">Metin</Label>
                  <Input
                    value={((selected.data as any).text as string) || ''}
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
