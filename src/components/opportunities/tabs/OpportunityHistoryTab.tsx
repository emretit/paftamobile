
import { useState } from "react";
import { Opportunity, ContactHistoryItem } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import NewContactForm from "../NewContactForm";

interface OpportunityHistoryTabProps {
  opportunity: Opportunity;
  onUpdateHistory: (data: Partial<Opportunity>) => Promise<void>;
}

const OpportunityHistoryTab = ({ 
  opportunity, 
  onUpdateHistory 
}: OpportunityHistoryTabProps) => {
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  
  const handleAddContact = async (newContact: Omit<ContactHistoryItem, 'id'>) => {
    const contactHistory = opportunity.contact_history || [];
    const updatedHistory = [
      {
        id: crypto.randomUUID(),
        ...newContact
      },
      ...contactHistory
    ];
    
    await onUpdateHistory({ contact_history: updatedHistory });
    setShowNewContactForm(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
  };

  // Get contact type label
  const getContactTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'call': 'Telefon',
      'email': 'E-posta',
      'meeting': 'Toplantı',
      'other': 'Diğer'
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">İletişim Geçmişi</h3>
          <Button 
            size="sm"
            onClick={() => setShowNewContactForm(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            İletişim Ekle
          </Button>
        </div>

        {showNewContactForm && (
          <div className="mb-4">
            <NewContactForm 
              opportunityId={opportunity.id}
              employeeId={opportunity.employee_id || undefined}
              onSubmit={handleAddContact}
              onCancel={() => setShowNewContactForm(false)}
            />
          </div>
        )}

        <div className="space-y-4">
          {opportunity.contact_history && opportunity.contact_history.length > 0 ? (
            <div className="relative pl-4 border-l border-gray-200">
              {opportunity.contact_history.map((contact, index) => (
                <div 
                  key={contact.id || index} 
                  className="mb-4 relative"
                >
                  <div className="absolute -left-[17px] top-0 w-7 h-7 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">
                      {formatDate(contact.date)}
                    </p>
                    <div className="bg-gray-50 p-3 rounded mt-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {getContactTypeLabel(contact.contact_type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {contact.employee_name || 'Kullanıcı'}
                        </span>
                      </div>
                      <p className="mt-1">{contact.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">Henüz iletişim kaydı bulunmamaktadır</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityHistoryTab;
