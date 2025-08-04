import React, { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { TemplateField } from '@/types/proposal-template';

interface FieldNodeData {
  fieldType: string;
  label: string;
  required: boolean;
  style: {
    width: string;
    alignment: 'left' | 'center' | 'right';
    fontSize: number;
    fontWeight: 'normal' | 'bold';
  };
}

interface FieldNodeProps {
  data: FieldNodeData;
  selected?: boolean;
}

const FieldNode: React.FC<FieldNodeProps> = memo(({ data, selected }) => {
  const getFieldTypeIcon = (fieldType: string) => {
    const icons: Record<string, string> = {
      text: '📝',
      number: '🔢',
      date: '📅',
      select: '📋',
      textarea: '📄',
      checkbox: '☑️',
      image: '🖼️',
      table: '📊',
    };
    return icons[fieldType] || '📝';
  };

  const getFieldTypeColor = (fieldType: string) => {
    const colors: Record<string, string> = {
      text: 'border-blue-300 bg-blue-50',
      number: 'border-green-300 bg-green-50',
      date: 'border-purple-300 bg-purple-50',
      select: 'border-orange-300 bg-orange-50',
      textarea: 'border-indigo-300 bg-indigo-50',
      checkbox: 'border-red-300 bg-red-50',
      image: 'border-pink-300 bg-pink-50',
      table: 'border-teal-300 bg-teal-50',
    };
    return colors[fieldType] || 'border-gray-300 bg-gray-50';
  };

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={40}
        isVisible={selected}
      />
      <div 
        className={`
          px-3 py-2 border-2 rounded-lg shadow-sm
          ${getFieldTypeColor(data.fieldType)}
          ${selected ? 'border-blue-500' : ''}
          transition-all duration-200
          min-w-[100px] min-h-[40px]
          flex items-center gap-2
        `}
        style={{
          fontSize: `${data.style.fontSize}px`,
          fontWeight: data.style.fontWeight,
          textAlign: data.style.alignment,
          width: data.style.width,
        }}
      >
        <span className="text-lg">{getFieldTypeIcon(data.fieldType)}</span>
        <div className="flex-1">
          <div className="text-sm font-medium">
            {data.label}
            {data.required && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {data.fieldType} field
          </div>
        </div>
      </div>
    </>
  );
});

export default FieldNode;