
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Opportunity, OpportunityPriority, opportunityPriorityLabels } from "@/types/crm";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface OpportunityBasicInfoProps {
  opportunity: Opportunity;
  editingValues: Partial<Opportunity>;
  onInputChange: (field: keyof Opportunity, value: any) => void;
  isReadOnly: boolean;
}

const OpportunityBasicInfo = ({ 
  opportunity, 
  editingValues, 
  onInputChange, 
  isReadOnly 
}: OpportunityBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Fırsat Başlığı</Label>
          <Input
            id="title"
            value={editingValues.title || opportunity.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50" : ""}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="value">Beklenen Değer</Label>
          <Input
            id="value"
            type="number"
            value={editingValues.value ?? opportunity.value}
            onChange={(e) => onInputChange('value', Number(e.target.value))}
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50" : ""}
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer">Müşteri</Label>
          <Input
            id="customer"
            value={opportunity.customer_name || "Müşteri atanmamış"}
            readOnly
            className="bg-gray-50"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employee">Sorumlu</Label>
          <Input
            id="employee"
            value={opportunity.employee_name || "Atanmamış"}
            readOnly
            className="bg-gray-50"
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priority">Öncelik</Label>
          <Select
            value={editingValues.priority || opportunity.priority}
            onValueChange={(value) => onInputChange('priority', value)}
            disabled={isReadOnly}
          >
            <SelectTrigger id="priority" className={isReadOnly ? "bg-gray-50" : ""}>
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
        
        <div className="space-y-2">
          <Label htmlFor="expected-close-date">Tahmini Kapanış Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="expected-close-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !editingValues.expected_close_date && !opportunity.expected_close_date && "text-muted-foreground",
                  isReadOnly && "bg-gray-50"
                )}
                disabled={isReadOnly}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {editingValues.expected_close_date || opportunity.expected_close_date ? 
                  format(new Date(editingValues.expected_close_date || opportunity.expected_close_date!), "PPP", { locale: tr }) : 
                  "Tarih seçin"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={editingValues.expected_close_date ? new Date(editingValues.expected_close_date) : 
                         opportunity.expected_close_date ? new Date(opportunity.expected_close_date) : undefined}
                onSelect={(date) => onInputChange('expected_close_date', date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={editingValues.description || opportunity.description || ""}
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={4}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-gray-50" : ""}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notlar</Label>
        <Textarea
          id="notes"
          value={editingValues.notes || opportunity.notes || ""}
          onChange={(e) => onInputChange('notes', e.target.value)}
          rows={3}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-gray-50" : ""}
        />
      </div>
    </div>
  );
};

export default OpportunityBasicInfo;
