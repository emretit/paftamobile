
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Deal } from "@/types/deal";

interface EditableFieldProps {
  field: keyof Deal;
  label: string;
  value: string | number;
  isEditing: boolean;
  editValue?: string | number;
  onEdit: (field: keyof Deal) => void;
  onSave: (field: keyof Deal) => void;
  onChange: (field: keyof Deal, value: string) => void;
}

export const EditableField = ({
  field,
  label,
  value,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onChange,
}: EditableFieldProps) => {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={editValue?.toString() || ''}
              onChange={(e) => onChange(field, e.target.value)}
              className="w-48"
            />
            <Button 
              onClick={() => onSave(field)}
              size="sm"
              variant="default"
            >
              Kaydet
            </Button>
          </>
        ) : (
          <>
            <span>{value}</span>
            <Button 
              onClick={() => onEdit(field)}
              size="sm"
              variant="ghost"
            >
              Düzenle
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
