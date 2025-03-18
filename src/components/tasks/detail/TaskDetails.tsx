
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskDetail } from "../hooks/useTaskDetail";
import type { Task } from "@/types/task";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

const TaskDetails = ({ task, onClose }: TaskDetailsProps) => {
  const [formData, setFormData] = useState<Task>(task);
  const { updateTaskMutation } = useTaskDetail();

  useEffect(() => {
    setFormData(task);
  }, [task]);

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateTaskMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Görev Detayları</h3>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Görev başlığı"
          className="mb-4"
        />
        <Textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Görev açıklaması"
          className="min-h-[100px] mb-4"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Durum</label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Yapılacak</SelectItem>
              <SelectItem value="in_progress">Devam Ediyor</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
              <SelectItem value="postponed">Ertelendi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Öncelik</label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleInputChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Düşük</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bitiş Tarihi</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.due_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.due_date ? format(new Date(formData.due_date), 'PPP') : <span>Tarih seç</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.due_date ? new Date(formData.due_date) : undefined}
                onSelect={(date) => handleInputChange('due_date', date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button 
        className="w-full"
        onClick={handleSave}
        disabled={updateTaskMutation.isPending}
      >
        {updateTaskMutation.isPending ? "Kaydediliyor..." : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Değişiklikleri Kaydet
          </>
        )}
      </Button>
    </div>
  );
};

export default TaskDetails;
