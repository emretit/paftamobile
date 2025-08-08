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
}

const SectionNode: React.FC<any> = ({ data }) => {
  const d = data as SectionNodeData;
  return (
    <div className="w-full h-full relative rounded-md border border-border bg-background text-foreground p-3">
      <NodeResizer minWidth={80} minHeight={40} />
      <div className="text-xs font-medium opacity-70 mb-1">{d.label}</div>
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
        <div className="text-sm leading-snug whitespace-pre-wrap">
          {d.text || 'Lorem ipsum dolor sit amet'}
        </div>
      )}
    </div>
  );
};

export default SectionNode;
