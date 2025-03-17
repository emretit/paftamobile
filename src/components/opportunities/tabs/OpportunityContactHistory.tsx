
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarIcon, User, Phone, Mail, MessageSquare, Plus } from "lucide-react";
import { Opportunity, ContactHistoryItem } from "@/types/crm";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";

interface OpportunityContactHistoryProps {
  opportunity: Opportunity;
}

const OpportunityContactHistory = ({ opportunity }: OpportunityContactHistoryProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState<Partial<ContactHistoryItem>>({
    id: uuidv4(),
    date: new Date().toISOString(),
    contact_type: 'meeting',
    notes: '',
    employee_id: opportunity.employee_id || ''
  });
  
  const queryClient = useQueryClient();
  
  const addContactMutation = useMutation({
    mutationFn: async (contactItem: Partial<ContactHistoryItem>) => {
      const contactHistory = opportunity.contact_history || [];
      const updatedHistory = [...contactHistory, contactItem];
      
      const { error } = await supabase
        .from('opportunities')
        .update({ contact_history: updatedHistory })
        .eq('id', opportunity.id);
        
      if (error) throw error;
      
      return updatedHistory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('İletişim geçmişi güncellendi');
      setIsAdding(false);
      setNewContact({
        id: uuidv4(),
        date: new Date().toISOString(),
        contact_type: 'meeting',
        notes: '',
        employee_id: opportunity.employee_id || ''
      });
    },
    onError: (error) => {
      toast.error('İletişim geçmişi güncellenirken bir hata oluştu');
      console.error('Error updating contact history:', error);
    }
  });
  
  const handleAddContact = () => {
    if (!newContact.notes || !newContact.date) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    
    addContactMutation.mutate(newContact as ContactHistoryItem);
  };
  
  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <User className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">İletişim Geçmişi</h3>
        {!isAdding && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAdding(true)}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ekle
          </Button>
        )}
      </div>
      
      {isAdding && (
        <div className="p-4 border rounded-md space-y-3 bg-red-50/50 border-red-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contact-type">İletişim Türü</Label>
              <Select
                value={newContact.contact_type}
                onValueChange={(value) => setNewContact({...newContact, contact_type: value as any})}
              >
                <SelectTrigger id="contact-type">
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
            
            <div className="space-y-2">
              <Label htmlFor="contact-date">Tarih</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="contact-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newContact.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newContact.date ? 
                      format(new Date(newContact.date), "PPP", { locale: tr }) : 
                      "Tarih seçin"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newContact.date ? new Date(newContact.date) : undefined}
                    onSelect={(date) => setNewContact({...newContact, date: date?.toISOString()})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact-notes">Notlar</Label>
            <Textarea
              id="contact-notes"
              value={newContact.notes}
              onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
              rows={3}
              placeholder="İletişim detaylarını girin..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAdding(false)}
            >
              İptal
            </Button>
            <Button 
              onClick={handleAddContact}
              className="bg-red-800 text-white hover:bg-red-900"
              disabled={addContactMutation.isPending}
            >
              Kaydet
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {opportunity.contact_history && opportunity.contact_history.length > 0 ? (
          opportunity.contact_history.map((contact) => (
            <div 
              key={contact.id} 
              className="p-3 border rounded-md bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-800">
                    {getContactTypeIcon(contact.contact_type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {contact.contact_type === 'call' ? 'Telefon' :
                       contact.contact_type === 'email' ? 'E-posta' :
                       contact.contact_type === 'meeting' ? 'Toplantı' : 'Diğer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {contact.date ? format(new Date(contact.date), "d MMMM yyyy", { locale: tr }) : ''}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {contact.employee_name || opportunity.employee_name || 'Atanmamış'}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-700">
                {contact.notes}
              </p>
            </div>
          )).reverse()
        ) : (
          <p className="text-center text-gray-500 py-4">Henüz bir iletişim geçmişi yok</p>
        )}
      </div>
    </div>
  );
};

export default OpportunityContactHistory;
