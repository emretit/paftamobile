
import { EditableField } from "./EditableField";
import type { Deal } from "@/types/deal";

interface DealTextFieldsProps {
  deal: Deal;
  editingFields: Record<string, boolean>;
  editValues: Partial<Deal>;
  onEdit: (field: keyof Deal) => void;
  onSave: (field: keyof Deal) => void;
  onChange: (field: keyof Deal, value: string) => void;
}

export const DealTextFields = ({
  deal,
  editingFields,
  editValues,
  onEdit,
  onSave,
  onChange
}: DealTextFieldsProps) => {
  return (
    <>
      {deal.description && (
        <div>
          <EditableField
            field="description"
            label="Açıklama"
            value={deal.description}
            isEditing={!!editingFields.description}
            editValue={editValues.description}
            onEdit={onEdit}
            onSave={onSave}
            onChange={onChange}
          />
        </div>
      )}

      {deal.notes && (
        <div>
          <EditableField
            field="notes"
            label="Notlar"
            value={deal.notes}
            isEditing={!!editingFields.notes}
            editValue={editValues.notes}
            onEdit={onEdit}
            onSave={onSave}
            onChange={onChange}
          />
        </div>
      )}

      {deal.internalComments && (
        <div>
          <EditableField
            field="internalComments"
            label="İç Notlar"
            value={deal.internalComments}
            isEditing={!!editingFields.internalComments}
            editValue={editValues.internalComments}
            onEdit={onEdit}
            onSave={onSave}
            onChange={onChange}
          />
        </div>
      )}
    </>
  );
};
