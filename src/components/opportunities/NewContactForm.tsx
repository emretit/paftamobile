
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface NewContactFormProps {
  opportunityId: string;
  employeeId?: string;
  onSubmit: (data: {
    date: string;
    contact_type: 'call' | 'email' | 'meeting' | 'other';
    notes: string;
    employee_id: string;
    employee_name?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const NewContactForm = ({ 
  opportunityId, 
  employeeId = '', 
  onSubmit, 
  onCancel 
}: NewContactFormProps) => {
  const [formData, setFormData] = useState({
    contact_type: 'call' as 'call' | 'email' | 'meeting' | 'other',
    notes: '',
    employee_id: employeeId || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.notes || !formData.employee_id) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        date: new Date().toISOString()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 border border-blue-100 bg-blue-50">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="contact_type">İletişim Tipi</Label>
          <Select 
            value={formData.contact_type} 
            onValueChange={(value) => handleSelectChange("contact_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="İletişim tipi seçin" />
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
          <Label htmlFor="notes">Notlar</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="İletişim notları..."
            value={formData.notes}
            onChange={handleInputChange}
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
