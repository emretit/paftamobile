
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskMetadataProps {
  task: Task;
  employees: any[] | undefined;
  onUpdate: (field: keyof Task, value: any) => void;
}

export const TaskMetadata = ({ task, employees, onUpdate }: TaskMetadataProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select
          value={task.priority}
          onValueChange={(value) => onUpdate("priority", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Öncelik seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Düşük</SelectItem>
            <SelectItem value="medium">Orta</SelectItem>
            <SelectItem value="high">Yüksek</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Select
          value={task.status}
          onValueChange={(value) => onUpdate("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Durum seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">Yapılacak</SelectItem>
            <SelectItem value="in_progress">Devam Ediyor</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Select
          value={task.assignee_id || ""}
          onValueChange={(value) => onUpdate("assignee_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Atanan kişi seçin" />
          </SelectTrigger>
          <SelectContent>
            {employees?.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !task.due_date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {task.due_date ? format(new Date(task.due_date), "PPP") : "Bitiş tarihi seçin"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={task.due_date ? new Date(task.due_date) : undefined}
              onSelect={(date) => onUpdate("due_date", date?.toISOString())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
