import React from 'react';
import { NodeResizer } from '@xyflow/react';

export type SectionKind =
  | 'header'
  | 'logo'
  | 'customer'
  | 'proposal'
  | 'items'
  | 'totals'
  | 'terms'
  | 'footer'
  | 'text';

export interface SectionNodeData {
  label: string;
  kind: SectionKind;
  text?: string;
  imageUrl?: string;
  style?: {
    showLabel?: boolean;
    align?: 'left' | 'center' | 'right';
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    padding?: number;
    bgColor?: string;
    borderColor?: string;
    borderWidth?: number;
    radius?: number;
  };
}

const SectionNode: React.FC<any> = ({ data }) => {
  const d = data as SectionNodeData;
  const style = d.style || {};
  const padding = style.padding ?? 12;
  const borderWidth = style.borderWidth ?? 1;
  const radius = style.radius ?? 8;
  const borderColor = style.borderColor ?? 'hsl(var(--border))';
  const bgColor = style.bgColor ?? 'hsl(var(--background))';
  const align = style.align ?? 'left';
  const fontSize = style.fontSize ?? 12;
  const fontWeight = style.fontWeight ?? 'normal';
  return (
    <div
      className="w-full h-full relative text-foreground"
      style={{
        padding,
        borderWidth,
        borderStyle: 'solid',
        borderColor,
        borderRadius: radius,
        backgroundColor: bgColor,
      }}
    >
      <NodeResizer minWidth={80} minHeight={40} />
      {(style.showLabel ?? true) && (
        <div className="text-[10px] font-medium opacity-70 mb-1 select-none">
          {d.label}
        </div>
      )}
      {d.kind === 'logo' ? (
        <div className="flex items-center justify-center h-full">
          {d.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.imageUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[10px] italic opacity-60">Logo (URL ekleyin)</div>
          )}
        </div>
      ) : (
        <div
          className="leading-snug whitespace-pre-wrap"
          style={{ textAlign: align, fontSize, fontWeight }}
        >
          {/* Kind'e göre daha iyi placeholder görünümleri */}
          {d.kind === 'items' ? (
            <div className="w-full">
              <div className="grid grid-cols-12 gap-1 text-[11px] font-medium opacity-80">
                <div className="col-span-6">Açıklama</div>
                <div className="col-span-2 text-center">Miktar</div>
                <div className="col-span-2 text-right">Birim</div>
                <div className="col-span-2 text-right">Toplam</div>
              </div>
              <div className="mt-1 space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-1 text-[11px] opacity-70">
                    <div className="col-span-6 truncate">Ürün {i + 1}</div>
                    <div className="col-span-2 text-center">1</div>
                    <div className="col-span-2 text-right">₺0,00</div>
                    <div className="col-span-2 text-right">₺0,00</div>
                  </div>
                ))}
              </div>
            </div>
          ) : d.kind === 'totals' ? (
            <div className="space-y-1 text-[12px]">
              <div className="flex justify-between"><span>Ara Toplam</span><span>₺0,00</span></div>
              <div className="flex justify-between"><span>KDV</span><span>₺0,00</span></div>
              <div className="flex justify-between font-semibold"><span>GENEL TOPLAM</span><span>₺0,00</span></div>
            </div>
          ) : d.kind === 'terms' ? (
            <ul className="list-disc list-inside text-[12px] opacity-80 space-y-1">
              <li>Ödeme şartları</li>
              <li>Teslimat bilgisi</li>
            </ul>
          ) : d.kind === 'header' ? (
            <div className="text-[14px]">
              <div className="font-semibold">Şirket Adı</div>
              <div className="text-[12px] opacity-70">Tagline</div>
            </div>
          ) : (
            <div>{d.text || 'Örnek metin'}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionNode;
