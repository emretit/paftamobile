
import { useState } from "react";
import { 
  Opportunity, 
  OpportunityStatus, 
  opportunityStatusLabels 
} from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { OpportunityStatusSelector } from "../OpportunityStatusSelector";
import { Building, DollarSign, Calendar, User } from "lucide-react";

interface OpportunityDetailsTabProps {
  opportunity: Opportunity;
  onStatusChange: (status: OpportunityStatus) => void;
  onUpdate: (data: Partial<Opportunity>) => Promise<void>;
  isUpdating: boolean;
}

const OpportunityDetailsTab = ({ 
  opportunity, 
  onStatusChange,
  onUpdate,
  isUpdating 
}: OpportunityDetailsTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: opportunity.title,
    description: opportunity.description || '',
    value: opportunity.value,
    expected_close_date: opportunity.expected_close_date || '',
    priority: opportunity.priority
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await onUpdate(formData);
    setIsEditing(false);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: opportunity.currency || 'TRY'
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Fırsat Bilgileri</h3>
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Düzenle
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isUpdating}
              >
                İptal
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                disabled={isUpdating}
              >
                Kaydet
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="title">Fırsat Başlığı</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Değer</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    value={formData.value}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Öncelik</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleSelectChange("priority", value)}
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
              
              <div>
                <Label htmlFor="expected_close_date">Tahmini Kapanış Tarihi</Label>
                <Input
                  id="expected_close_date"
                  name="expected_close_date"
                  type="date"
                  value={formData.expected_close_date ? new Date(formData.expected_close_date).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-500">Başlık</p>
                <p className="font-medium">{opportunity.title}</p>
              </div>
              
              {opportunity.description && (
                <div>
                  <p className="text-sm text-gray-500">Açıklama</p>
                  <p>{opportunity.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Değer
                  </p>
                  <p className="font-medium">{formatCurrency(opportunity.value)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Tahmini Kapanış
                  </p>
                  <p>
                    {opportunity.expected_close_date 
                      ? new Date(opportunity.expected_close_date).toLocaleDateString('tr-TR') 
                      : 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    Müşteri
                  </p>
                  <p>{opportunity.customer_name || 'Belirtilmemiş'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Sorumlu
                  </p>
                  <p>{opportunity.employee_name || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </>
          )}
          
          <Separator className="my-4" />
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Durum</p>
            <OpportunityStatusSelector 
              currentStatus={opportunity.status} 
              onStatusChange={onStatusChange}
              isUpdating={isUpdating}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityDetailsTab;
