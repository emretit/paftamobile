
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import OpportunityTasks from "./OpportunityTasks";
import { EditableField } from "./components/EditableField";
import { DealHeader } from "./components/DealHeader";
import { useDealEditing } from "./hooks/useDealEditing";
import { useOpportunityTasks } from "./hooks/useOpportunityTasks";
import type { Deal } from "@/types/deal";

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

  const { data: tasks } = useOpportunityTasks(deal.id);

  const formatDate = (date: Date) => {
    return format(new Date(date), 'PP');
  };

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

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <EditableField
                  field="value"
                  label="Fırsat Değeri"
                  value={`$${deal.value.toLocaleString()}`}
                  isEditing={!!editingFields.value}
                  editValue={editValues.value}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onChange={handleChange}
                />
              </Card>
              <Card className="p-4">
                <EditableField
                  field="employeeName"
                  label="Satış Temsilcisi"
                  value={deal.employeeName}
                  isEditing={!!editingFields.employeeName}
                  editValue={editValues.employeeName}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onChange={handleChange}
                />
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-600 mb-1">Teklif Tarihi</h3>
                <p>{formatDate(deal.proposalDate)}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-600 mb-1">Son İletişim</h3>
                <p>{formatDate(deal.lastContactDate)}</p>
              </div>
              {deal.expectedCloseDate && (
                <div>
                  <h3 className="font-medium text-gray-600 mb-1">Tahmini Kapanış</h3>
                  <p>{formatDate(deal.expectedCloseDate)}</p>
                </div>
              )}
            </div>

            {deal.description && (
              <div>
                <EditableField
                  field="description"
                  label="Açıklama"
                  value={deal.description}
                  isEditing={!!editingFields.description}
                  editValue={editValues.description}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onChange={handleChange}
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
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onChange={handleChange}
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
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onChange={handleChange}
                />
              </div>
            )}

            {deal && (
              <OpportunityTasks
                opportunity={deal}
                tasks={tasks || []}
                onEditTask={(task) => {
                  console.log('Edit task:', task);
                }}
                onSelectTask={(task) => {
                  console.log('Select task:', task);
                }}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailsModal;
