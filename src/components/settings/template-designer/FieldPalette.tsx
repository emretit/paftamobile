import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Type, 
  Hash, 
  Calendar, 
  List, 
  FileText, 
  CheckSquare, 
  Image, 
  Table 
} from 'lucide-react';

const fieldTypes = [
  { type: 'text', label: 'Metin Alanı', icon: Type, color: 'bg-blue-100 text-blue-600' },
  { type: 'number', label: 'Sayı Alanı', icon: Hash, color: 'bg-green-100 text-green-600' },
  { type: 'date', label: 'Tarih Alanı', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
  { type: 'select', label: 'Seçim Listesi', icon: List, color: 'bg-orange-100 text-orange-600' },
  { type: 'textarea', label: 'Uzun Metin', icon: FileText, color: 'bg-indigo-100 text-indigo-600' },
  { type: 'checkbox', label: 'Onay Kutusu', icon: CheckSquare, color: 'bg-red-100 text-red-600' },
  { type: 'image', label: 'Resim', icon: Image, color: 'bg-pink-100 text-pink-600' },
  { type: 'table', label: 'Tablo', icon: Table, color: 'bg-teal-100 text-teal-600' },
];

const FieldPalette: React.FC = () => {
  const onDragStart = (event: React.DragEvent, fieldType: string) => {
    event.dataTransfer.setData('application/reactflow', fieldType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="h-full p-4">
      <h3 className="text-lg font-semibold mb-4">Alan Türleri</h3>
      <div className="space-y-2">
        {fieldTypes.map((field) => {
          const IconComponent = field.icon;
          return (
            <div
              key={field.type}
              draggable
              onDragStart={(event) => onDragStart(event, field.type)}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded ${field.color}`}>
                <IconComponent size={16} />
              </div>
              <span className="text-sm font-medium">{field.label}</span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 İpucu: Alanları sağdaki PDF önizlemesine sürükleyip bırakın
        </p>
      </div>
    </Card>
  );
};

export default FieldPalette;