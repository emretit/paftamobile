
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    customer: "",
    value: "",
    status: "discovery_scheduled",
    description: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting opportunity data:", formData);
    // Add your submit logic here
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Fırsat Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Fırsat Başlığı</Label>
            <Input 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="customer">Müşteri</Label>
            <Input 
              id="customer" 
              name="customer" 
              value={formData.customer} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="value">Tahmini Değer (TL)</Label>
            <Input 
              id="value" 
              name="value" 
              type="number" 
              value={formData.value} 
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <Label htmlFor="status">Durum</Label>
            <Select 
              value={formData.status} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discovery_scheduled">Keşif Planlandı</SelectItem>
                <SelectItem value="meeting_completed">Görüşme Tamamlandı</SelectItem>
                <SelectItem value="quote_in_progress">Teklif Hazırlanıyor</SelectItem>
                <SelectItem value="quote_sent">Teklif Gönderildi</SelectItem>
                <SelectItem value="negotiation">Müzakere Aşaması</SelectItem>
                <SelectItem value="approved">Onaylandı</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={3} 
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit">
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityForm;
