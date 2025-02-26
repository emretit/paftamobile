
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditableField } from "./EditableField";
import { getStatusColor, getPriorityColor } from "../utils/colorUtils";
import type { Deal } from "@/types/deal";

interface DealHeaderProps {
  deal: Deal;
  isEditing: Record<string, boolean>;
  editValues: Partial<Deal>;
  onEdit: (field: keyof Deal) => void;
  onSave: (field: keyof Deal) => void;
  onChange: (field: keyof Deal, value: string) => void;
}

export const DealHeader = ({ 
  deal, 
  isEditing, 
  editValues,
  onEdit,
  onSave,
  onChange
}: DealHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        {isEditing.title ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValues.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              className="text-2xl font-bold"
            />
            <Button onClick={() => onSave('title')}>
              Kaydet
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{deal.title}</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit('title')}
            >
              Düzenle
            </Button>
          </div>
        )}
        <EditableField
          field="customerName"
          label="Müşteri"
          value={deal.customerName}
          isEditing={isEditing.customerName}
          editValue={editValues.customerName}
          onEdit={onEdit}
          onSave={onSave}
          onChange={onChange}
        />
        {deal.department && (
          <EditableField
            field="department"
            label="Departman"
            value={deal.department}
            isEditing={isEditing.department}
            editValue={editValues.department}
            onEdit={onEdit}
            onSave={onSave}
            onChange={onChange}
          />
        )}
      </div>
      <div className="flex gap-2">
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(deal.status)}`}>
          {deal.status.replace('_', ' ')}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(deal.priority)}`}>
          {deal.priority}
        </span>
      </div>
    </div>
  );
};
