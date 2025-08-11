export interface PredefinedElement {
  id: string;
  name: string;
  label: string;
  category: string;
  type: 'text' | 'multiline' | 'number' | 'date' | 'image' | 'table';
  defaultProps: {
    position: { x: number; y: number };
    width: number;
    height: number;
    fontSize?: number;
    fontName?: string;
    alignment?: 'left' | 'center' | 'right';
    fontColor?: string;
    backgroundColor?: string;
    borderWidth?: number;
    borderColor?: string;
  };
  dataBinding?: string;
  description: string;
  icon: string;
}

export interface ElementCategory {
  id: string;
  name: string;
  icon: string;
  elements: PredefinedElement[];
}

export interface DroppedElement extends PredefinedElement {
  instanceId: string;
  position: { x: number; y: number };
  selected?: boolean;
}

export interface TemplateBuilderProps {
  initialTemplate?: any;
  onTemplateChange?: (template: any) => void;
  onSave?: (template: any, name: string) => void;
}