
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
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
  selectedEvent: CalendarEvent;
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
    if (confirm('Are you sure you want to delete this task?')) {
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
            {selectedEvent.resource?.description || 'No description provided'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          {selectedEvent.resource?.status && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm font-medium mb-1">Status</div>
              <div className="flex items-center">
                <span className="capitalize">{selectedEvent.resource.status.replace('_', ' ')}</span>
              </div>
            </div>
          )}

          {selectedEvent.resource?.priority && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm font-medium mb-1">Priority</div>
              <div className="flex items-center">
                <PriorityBadge priority={selectedEvent.resource.priority} />
              </div>
            </div>
          )}

          {selectedEvent.start && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm font-medium mb-1">Due Date</div>
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
              <div className="text-sm font-medium mb-1">Assigned To</div>
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
          <Button onClick={onViewTask}>View Task Details</Button>
          <Button variant="outline" onClick={onEditTask}>Edit Task</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete Task</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskQuickView;
