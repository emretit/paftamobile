
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { Calendar, Clock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/tasks/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { CalendarEvent } from '@/components/tasks/hooks/useTaskCalendar';

interface TaskQuickViewProps {
  selectedEvent: CalendarEvent | null;
  onViewTask: () => void;
  onEditTask: () => void;
  onDeleteTask: (taskId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskQuickView = ({
  selectedEvent,
  onViewTask,
  onEditTask,
  onDeleteTask,
  open,
  onOpenChange
}: TaskQuickViewProps) => {
  if (!selectedEvent) return null;

  const handleDelete = () => {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      onDeleteTask(selectedEvent.id);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl">{selectedEvent.title}</SheetTitle>
          <SheetDescription>
            {selectedEvent.resource?.description || 'Açıklama bulunmuyor'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          {selectedEvent.resource?.status && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm font-medium mb-1">Durum</div>
              <div className="flex items-center">
                <span className="capitalize">
                  {selectedEvent.resource.status === 'todo' ? 'Yapılacak' :
                   selectedEvent.resource.status === 'in_progress' ? 'Devam Ediyor' :
                   selectedEvent.resource.status === 'completed' ? 'Tamamlandı' : 'Ertelendi'}
                </span>
              </div>
            </div>
          )}

          {selectedEvent.resource?.priority && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm font-medium mb-1">Öncelik</div>
              <div className="flex items-center">
                <PriorityBadge priority={selectedEvent.resource.priority} />
              </div>
            </div>
          )}

          {selectedEvent.start && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm font-medium mb-1">Son Tarih</div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>{format(new Date(selectedEvent.start), 'PPP', { locale: tr })}</span>
              </div>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>{format(new Date(selectedEvent.start), 'p', { locale: tr })}</span>
              </div>
            </div>
          )}

          {selectedEvent.resource?.assignee && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm font-medium mb-1">Atanan Kişi</div>
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage
                    src={selectedEvent.resource.assignee.avatar}
                    alt={selectedEvent.resource.assignee.name}
                  />
                  <AvatarFallback>
                    {selectedEvent.resource.assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{selectedEvent.resource.assignee.name}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-8">
          <Button onClick={onViewTask}>Görev Detaylarını Görüntüle</Button>
          <Button variant="outline" onClick={onEditTask}>Görevi Düzenle</Button>
          <Button variant="destructive" onClick={handleDelete}>Görevi Sil</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskQuickView;
