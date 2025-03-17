import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { opportunityPriorityLabels } from "@/types/crm";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createTaskForOpportunity } from "@/services/crmWorkflowService";
import { mockOpportunitiesAPI } from "@/services/mockCrmService";

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityToEdit?: any;
}

const OpportunityForm = ({ isOpen, onClose, opportunityToEdit }: OpportunityFormProps) => {
  const [formData, setFormData] = useState({
    title: opportunityToEdit?.title || "",
    description: opportunityToEdit?.description || "",
    value: opportunityToEdit?.value || 0,
    priority: opportunityToEdit?.priority || "medium",
    customer_id: opportunityToEdit?.customer_id || "",
    employee_id: opportunityToEdit?.employee_id || "",
    expected_close_date: opportunityToEdit?.expected_close_date ? new Date(opportunityToEdit.expected_close_date) : undefined
  });
  
  const queryClient = useQueryClient();
  
  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, company');
        
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch employees for dropdown
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name');
        
      if (error) throw error;
      return data;
    }
  });
  
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: any) => {
      // Set initial status to 'new'
      const newOpportunity = {
        ...data,
        status: 'new'
      };
      
      if (opportunityToEdit) {
        // Update existing
        const { data: updatedOpportunity, error } = await mockOpportunitiesAPI.updateOpportunity(
          opportunityToEdit.id, 
          newOpportunity
        );
          
        if (error) throw error;
        return updatedOpportunity;
      } else {
        // Create new
        const { data: createdOpportunity, error } = await mockOpportunitiesAPI.createOpportunity(newOpportunity);
          
        if (error) throw error;
        return createdOpportunity;
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success(opportunityToEdit ? 'Fırsat güncellendi' : 'Fırsat oluşturuldu');
      
      // For new opportunities, create an initial task
      if (!opportunityToEdit && data) {
        await createTaskForOpportunity(
          data.id,
          data.title,
          'new',
          data.employee_id
        );
      }
      
      onClose();
    },
    onError: (error) => {
      toast.error(opportunityToEdit ? 'Fırsat güncellenirken bir hata oluştu' : 'Fırsat oluşturulurken bir hata oluştu');
      console.error('Error with opportunity:', error);
    }
  });
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.title.trim()) {
      toast.error('Fırsat başlığı gerekli');
      return;
    }
    
    // Prepare data
    const opportunityData = {
      ...formData,
      expected_close_date: formData.expected_close_date?.toISOString()
    };
    
    createOpportunityMutation.mutate(opportunityData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {opportunityToEdit ? 'Fırsatı Düzenle' : 'Yeni Fırsat Oluştur'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Fırsat Başlığı</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Fırsat başlığı girin"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Fırsatın açıklamasını girin"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Beklenen Değer</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => handleInputChange('value', Number(e.target.value))}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Öncelik</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(opportunityPriorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Müşteri</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => handleInputChange('customer_id', value)}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company ? `${customer.name} (${customer.company})` : customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employee">Sorumlu</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => handleInputChange('employee_id', value)}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Çalışan seçin" />
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expected_close_date">Tahmini Kapanış Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="expected_close_date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expected_close_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expected_close_date ? 
                    format(formData.expected_close_date, "PPP", { locale: tr }) : 
                    "Tarih seçin"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expected_close_date}
                  onSelect={(date) => handleInputChange('expected_close_date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              className="bg-red-800 text-white hover:bg-red-900"
              disabled={createOpportunityMutation.isPending}
            >
              {opportunityToEdit ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityForm;
