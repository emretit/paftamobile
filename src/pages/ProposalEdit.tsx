
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, CalendarIcon, Building, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { mockCrmService } from "@/services/mockCrm";
import { crmService } from "@/services/crmService";
import { Proposal, ProposalStatus, proposalStatusLabels } from "@/types/proposal";
import { useProposalForm } from "@/hooks/useProposalForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/components/products/utils/priceUtils";

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isLoading: isSaving } = useProposalForm();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    valid_until: "",
    payment_terms: "",
    delivery_terms: "",
    notes: "",
    status: "" as ProposalStatus
  });

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await mockCrmService.getProposalById(id);
        
        if (error) {
          toast.error("Teklif bilgileri yüklenemedi");
          throw error;
        }
        
        if (data) {
          setProposal(data);
          // Initialize form with proposal data
          setFormData({
            title: data.title || "",
            description: data.description || "",
            valid_until: data.valid_until || "",
            payment_terms: data.payment_terms || "",
            delivery_terms: data.delivery_terms || "",
            notes: data.notes || "",
            status: data.status
          });
        }
      } catch (error) {
        console.error("Error fetching proposal:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposal();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        valid_until: date.toISOString()
      }));
    }
  };

  const handleBack = () => {
    navigate(`/proposal/${id}`);
  };

  const handleSave = async () => {
    if (!proposal || !id) return;
    
    try {
      setSaving(true);
      
      // Update the proposal with the form data
      const updatedProposal = {
        ...proposal,
        title: formData.title,
        description: formData.description,
        valid_until: formData.valid_until,
        payment_terms: formData.payment_terms,
        delivery_terms: formData.delivery_terms,
        notes: formData.notes,
        status: formData.status,
        updated_at: new Date().toISOString()
      };
      
      // Call the update API
      await crmService.updateProposal(id, updatedProposal);
      
      toast.success("Teklif başarıyla güncellendi");
      navigate(`/proposal/${id}`);
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Teklif güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return "";
    }
  };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Düzenle"
      subtitle="Teklif bilgilerini güncelleyin"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-40" /> : `${formData.title} Düzenle`}
          </h1>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || loading || saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Değişiklikleri Kaydet
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Teklif Başlığı</Label>
                  <Input 
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Teklif başlığını girin"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Durum</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange("status", value as ProposalStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{proposalStatusLabels.draft}</SelectItem>
                      <SelectItem value="pending_approval">{proposalStatusLabels.pending_approval}</SelectItem>
                      <SelectItem value="sent">{proposalStatusLabels.sent}</SelectItem>
                      <SelectItem value="accepted">{proposalStatusLabels.accepted}</SelectItem>
                      <SelectItem value="rejected">{proposalStatusLabels.rejected}</SelectItem>
                      <SelectItem value="expired">{proposalStatusLabels.expired}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Geçerlilik Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.valid_until ? formatDate(formData.valid_until) : "Tarih seçin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.valid_until ? new Date(formData.valid_until) : undefined}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center mb-2">
                    <Building className="h-4 w-4 mr-2" />
                    Müşteri
                  </div>
                  <div className="font-medium">
                    {proposal?.customer?.name || proposal?.customer_name || "Müşteri belirtilmemiş"}
                  </div>
                  
                  {proposal?.customer?.company && (
                    <div className="text-sm text-muted-foreground">
                      {proposal.customer.company}
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Satış Temsilcisi
                  </div>
                  <div className="font-medium">
                    {proposal?.employee 
                      ? `${proposal.employee.first_name} ${proposal.employee.last_name}` 
                      : proposal?.employee_name || "Belirtilmemiş"}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center mb-2">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Toplam Tutar
                  </div>
                  <div className="font-medium text-lg">
                    {formatCurrency(proposal?.total_amount || 0, proposal?.currency || "TRY")}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea 
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Teklif açıklaması girin"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Ödeme Şartları</Label>
                <Textarea 
                  id="payment_terms"
                  name="payment_terms"
                  value={formData.payment_terms || ""}
                  onChange={handleInputChange}
                  placeholder="Ödeme şartlarını belirtin"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delivery_terms">Teslimat Şartları</Label>
                <Textarea 
                  id="delivery_terms"
                  name="delivery_terms"
                  value={formData.delivery_terms || ""}
                  onChange={handleInputChange}
                  placeholder="Teslimat şartlarını belirtin"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea 
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                placeholder="Ek notlar girin"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleBack}>
                İptal
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        )}
      </Card>
    </DefaultLayout>
  );
};

export default ProposalEdit;
