
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DealHeader } from "./components/DealHeader";
import { DealMainInfo } from "./components/DealMainInfo";
import { DealDates } from "./components/DealDates";
import { DealTextFields } from "./components/DealTextFields";
import { useDealEditing } from "./hooks/useDealEditing";
import type { Deal } from "@/types/deal";
import type { Task } from "@/types/task";

interface DealDetailsModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

const DealDetailsModal = ({ deal, isOpen, onClose }: DealDetailsModalProps) => {
  if (!deal) return null;

  const {
    editingFields,
    editValues,
    handleEdit,
    handleChange,
    handleSave
  } = useDealEditing(deal);

  const tasks: Task[] = []; // Temporarily empty array until we reimplement task functionality

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detaylar</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <div className="space-y-6">
            <DealHeader
              deal={deal}
              isEditing={editingFields}
              editValues={editValues}
              onEdit={handleEdit}
              onSave={handleSave}
              onChange={handleChange}
            />

            <DealMainInfo
              deal={deal}
              editingFields={editingFields}
              editValues={editValues}
              onEdit={handleEdit}
              onSave={handleSave}
              onChange={handleChange}
            />

            <DealDates deal={deal} />

            <DealTextFields
              deal={deal}
              editingFields={editingFields}
              editValues={editValues}
              onEdit={handleEdit}
              onSave={handleSave}
              onChange={handleChange}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailsModal;
