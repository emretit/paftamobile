
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  status: "new" | "negotiation" | "follow_up" | "won" | "lost";
  priority: "low" | "medium" | "high";
  customerName: string;
  employeeName: string;
  expectedCloseDate?: Date;
  proposalDate: Date;
  lastContactDate: Date;
  notes?: string;
  internalComments?: string;
  department?: string;
  contactHistory?: any[];
  proposalFiles?: any[];
  nextSteps?: any[];
  productServices?: any[];
  validityPeriod?: any;
  reminders?: any[];
}

interface DealDetailsModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

const DealDetailsModal = ({ deal, isOpen, onClose }: DealDetailsModalProps) => {
  if (!deal) return null;

  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [editValues, setEditValues] = useState(deal);

  const formatDate = (date: Date) => {
    return format(new Date(date), 'PP');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-700",
      negotiation: "bg-yellow-100 text-yellow-700",
      follow_up: "bg-purple-100 text-purple-700",
      won: "bg-green-100 text-green-700",
      lost: "bg-red-100 text-red-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const handleEdit = (field: string) => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ [field]: editValues[field as keyof Deal] })
        .eq('id', deal.id);

      if (error) throw error;

      setIsEditing(prev => ({ ...prev, [field]: false }));
      toast.success('Değişiklikler kaydedildi');
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Değişiklikler kaydedilirken bir hata oluştu');
    }
  };

  const renderEditableField = (
    field: keyof Deal,
    label: string,
    value: string | number
  ) => {
    return (
      <div className="flex justify-between items-center gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="flex items-center gap-2">
          {isEditing[field] ? (
            <>
              <Input
                type={typeof value === 'number' ? 'number' : 'text'}
                value={editValues[field]}
                onChange={(e) => setEditValues(prev => ({
                  ...prev,
                  [field]: e.target.value
                }))}
                className="w-48"
              />
              <Button 
                onClick={() => handleSave(field)}
                size="sm"
                variant="default"
              >
                Kaydet
              </Button>
            </>
          ) : (
            <>
              <span>{value}</span>
              <Button 
                onClick={() => handleEdit(field)}
                size="sm"
                variant="ghost"
              >
                Düzenle
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detaylar</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                {isEditing.title ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editValues.title}
                      onChange={(e) => setEditValues(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                      className="text-2xl font-bold"
                    />
                    <Button onClick={() => handleSave('title')}>
                      Kaydet
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">{deal.title}</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit('title')}
                    >
                      Düzenle
                    </Button>
                  </div>
                )}
                {renderEditableField('customerName', 'Müşteri', deal.customerName)}
                {deal.department && (
                  renderEditableField('department', 'Departman', deal.department)
                )}
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(deal.status)}`}>
                  {deal.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(deal.priority)}`}>
                  {deal.priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                {renderEditableField('value', 'Fırsat Değeri', `$${deal.value.toLocaleString()}`)}
              </Card>
              <Card className="p-4">
                {renderEditableField('employeeName', 'Satış Temsilcisi', deal.employeeName)}
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-600 mb-1">Teklif Tarihi</h3>
                <p>{formatDate(deal.proposalDate)}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-600 mb-1">Son İletişim</h3>
                <p>{formatDate(deal.lastContactDate)}</p>
              </div>
              {deal.expectedCloseDate && (
                <div>
                  <h3 className="font-medium text-gray-600 mb-1">Tahmini Kapanış</h3>
                  <p>{formatDate(deal.expectedCloseDate)}</p>
                </div>
              )}
            </div>

            {deal.description && (
              <div>
                {renderEditableField('description', 'Açıklama', deal.description)}
              </div>
            )}

            {deal.productServices && deal.productServices.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-600 mb-2">Ürünler & Hizmetler</h3>
                <div className="space-y-2">
                  {deal.productServices.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <span>${item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deal.nextSteps && deal.nextSteps.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-600 mb-2">Sonraki Adımlar</h3>
                <div className="space-y-2">
                  {deal.nextSteps.map((step: any) => (
                    <div key={step.id} className="flex justify-between items-center">
                      <span>{step.action}</span>
                      <span className="text-sm text-gray-500">{step.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deal.notes && (
              <div>
                {renderEditableField('notes', 'Notlar', deal.notes)}
              </div>
            )}

            {deal.internalComments && (
              <div>
                {renderEditableField('internalComments', 'İç Notlar', deal.internalComments)}
              </div>
            )}

            {deal.proposalFiles && deal.proposalFiles.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-600 mb-2">Teklif Dosyaları</h3>
                <div className="space-y-2">
                  {deal.proposalFiles.map((file: any) => (
                    <div key={file.id} className="flex items-center gap-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {file.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailsModal;
