
import { format } from "date-fns";
import { tr } from 'date-fns/locale/tr';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import type { Task } from "@/types/task";
import { CalendarEvent } from "../hooks/useTaskCalendar";

interface TaskQuickViewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEvent: CalendarEvent | null;
  onViewTask: () => void;
  onEditTask: () => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskQuickView = ({
  isOpen,
  onOpenChange,
  selectedEvent,
  onViewTask,
  onEditTask,
  onDeleteTask
}: TaskQuickViewProps) => {
  if (!selectedEvent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedEvent?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {selectedEvent?.resource.description && (
            <p className="text-sm text-gray-600">{selectedEvent.resource.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Durum</p>
              <div className="text-sm">
                {selectedEvent?.resource.status === "todo" && "Yapılacak"}
                {selectedEvent?.resource.status === "in_progress" && "Devam Ediyor"}
                {selectedEvent?.resource.status === "completed" && "Tamamlandı"}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Öncelik</p>
              <div className="text-sm">
                {selectedEvent?.resource.priority === "high" && "Yüksek"}
                {selectedEvent?.resource.priority === "medium" && "Orta"}
                {selectedEvent?.resource.priority === "low" && "Düşük"}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Atanan</p>
              <div className="text-sm">
                {selectedEvent?.resource.assignee?.name || "-"}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">Tarih</p>
              <div className="text-sm">
                {selectedEvent?.resource.due_date && format(new Date(selectedEvent.resource.due_date), "dd MMMM yyyy", { locale: tr })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={onViewTask}>
              Görüntüle
            </Button>
            <Button size="sm" onClick={onEditTask}>
              <Pencil className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                onDeleteTask(selectedEvent?.id || '');
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
