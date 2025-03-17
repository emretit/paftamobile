
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ContactHistoryEntry } from "@/types/crm";

interface NewContactFormProps {
  opportunityId: string;
  employeeId?: string;
  onSubmit: (contact: Omit<ContactHistoryEntry, "id">) => Promise<void>;
  onCancel: () => void;
}

const NewContactForm = ({ 
  opportunityId, 
  employeeId, 
  onSubmit, 
  onCancel 
}: NewContactFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString(),
    contact_type: "call" as "call" | "email" | "meeting" | "other",
    notes: "",
    employee_id: employeeId || "",
    employee_name: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, contact_type: value as "call" | "email" | "meeting" | "other" }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="p-4 border border-blue-100 bg-blue-50">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_type">İletişim Türü</Label>
            <Select 
              value={formData.contact_type} 
              onValueChange={handleSelectChange}
            >
              <SelectTrigger id="contact_type">
                <SelectValue placeholder="İletişim türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Telefon</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
                <SelectItem value="meeting">Toplantı</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="employee_name">İletişim Kuran</Label>
            <Input
              id="employee_name"
              name="employee_name"
              value={formData.employee_name}
              onChange={handleChange}
              placeholder="Adınız"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="notes">Notlar</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="İletişim detaylarını girin..."
            rows={3}
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !formData.notes}
          >
            Kaydet
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NewContactForm;
