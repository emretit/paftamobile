
import { Card } from "@/components/ui/card";
import { EditableField } from "./EditableField";
import type { Deal } from "@/types/deal";

interface DealMainInfoProps {
  deal: Deal;
  editingFields: Record<string, boolean>;
  editValues: Partial<Deal>;
  onEdit: (field: keyof Deal) => void;
  onSave: (field: keyof Deal) => void;
  onChange: (field: keyof Deal, value: string) => void;
}

export const DealMainInfo = ({
  deal,
  editingFields,
  editValues,
  onEdit,
  onSave,
  onChange
}: DealMainInfoProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <EditableField
          field="value"
          label="Fırsat Değeri"
          value={`$${deal.value.toLocaleString()}`}
          isEditing={!!editingFields.value}
          editValue={editValues.value}
          onEdit={onEdit}
          onSave={onSave}
          onChange={onChange}
        />
      </Card>
      <Card className="p-4">
        <EditableField
          field="employeeName"
          label="Satış Temsilcisi"
          value={deal.employeeName}
          isEditing={!!editingFields.employeeName}
          editValue={editValues.employeeName}
          onEdit={onEdit}
          onSave={onSave}
          onChange={onChange}
        />
      </Card>
    </div>
  );
};
