
import { useState } from "react";
import { useTaskDetail } from "@/components/tasks/hooks/useTaskDetail";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Task } from "@/types/task";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

const TaskDetails = ({ task, onClose }: TaskDetailsProps) => {
  const { updateTaskMutation } = useTaskDetail();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority,
    type: task.type,
    due_date: task.due_date ? new Date(task.due_date) : undefined,
    assignee_id: task.assignee_id,
    related_item_id: task.related_item_id,
    related_item_type: task.related_item_type,
    related_item_title: task.related_item_title,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const { id, title, description, status, priority, type, due_date, assignee_id, related_item_id, related_item_type, related_item_title } = formData;
      
      // Create update payload without subtasks property
      const updatePayload = {
        id,
        title,
        description,
        status,
        priority,
        type,
        due_date: due_date ? due_date.toISOString() : undefined,
        assignee_id,
        related_item_id,
        related_item_type,
        related_item_title
      };
      
      await updateTaskMutation.mutateAsync(updatePayload);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Görev Detayları</h3>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Düzenle
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Başlık</Label>
            <p className="font-medium">{task.title}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Açıklama</Label>
            <p className="whitespace-pre-wrap">{task.description || "Açıklama bulunmuyor"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Durum</Label>
              <p className="font-medium capitalize">{task.status}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Öncelik</Label>
              <p className="font-medium capitalize">{task.priority}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Görev Türü</Label>
              <p className="font-medium capitalize">{task.type}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Son Tarih</Label>
              <p className="font-medium">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : "Belirtilmemiş"}
              </p>
            </div>
          </div>

          {task.assignee && (
            <div>
              <Label className="text-muted-foreground">Sorumlu</Label>
              <p className="font-medium">{task.assignee.first_name} {task.assignee.last_name}</p>
            </div>
          )}

          {task.related_item_title && (
            <div>
              <Label className="text-muted-foreground">İlgili {task.related_item_type === "opportunity" ? "Fırsat" : "Teklif"}</Label>
              <p className="font-medium">{task.related_item_title}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Görevi Düzenle</h3>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
          İptal
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Durum</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Yapılacak</SelectItem>
                <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="postponed">Ertelendi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Öncelik</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange("priority", value)}
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Görev Türü</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Genel</SelectItem>
                <SelectItem value="call">Arama</SelectItem>
                <SelectItem value="meeting">Toplantı</SelectItem>
                <SelectItem value="follow_up">Takip</SelectItem>
                <SelectItem value="proposal">Teklif</SelectItem>
                <SelectItem value="opportunity">Fırsat</SelectItem>
                <SelectItem value="reminder">Hatırlatıcı</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="due_date">Son Tarih</Label>
            <DatePicker
              selected={formData.due_date}
              onSelect={(date) => handleChange("due_date", date)}
              placeholder="Tarih seçin"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
            İptal
          </Button>
          <Button type="button" onClick={handleSave}>
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
