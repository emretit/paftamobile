import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Building, User, Mail, Phone, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { customers, isLoading: customersLoading } = useCustomerSelect();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    customer_id: "",
    value: "",
    currency: "TRY",
    status: "new",
    priority: "medium",
    description: ""
  });

  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    address: ""
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleCustomerSelect = (customerId: string) => {
    setFormData(prev => ({ ...prev, customer_id: customerId }));
    setCustomerPopoverOpen(false);
    setShowNewCustomerForm(false);
  };

  const selectedCustomer = customers?.find(customer => customer.id === formData.customer_id);

  const handleNewCustomerSubmit = async () => {
    
    if (!newCustomerData.company.trim() || !newCustomerData.name.trim()) {
      toast({
        title: "Hata",
        description: "Şirket adı ve iletişim kişisi zorunludur",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingCustomer(true);
    
    try {
      const { data: newCustomer, error } = await supabase
        .from("customers")
                     .insert({
               company: newCustomerData.company,
               name: newCustomerData.name,
               email: newCustomerData.email || null,
               mobile_phone: newCustomerData.phone || null,
               city: newCustomerData.city || null,
               address: newCustomerData.address || null,
               type: "kurumsal",
               status: "potansiyel", // Potansiyel müşteri olarak ekle
               balance: 0
             })
        .select()
        .single();

      if (error) throw error;

      // Yeni müşteriyi seç
      setFormData(prev => ({ ...prev, customer_id: newCustomer.id }));
      setShowNewCustomerForm(false);
      setCustomerPopoverOpen(false);
      
      // Form'u temizle
      setNewCustomerData({
        company: "",
        name: "",
        email: "",
        phone: "",
        city: "",
        address: ""
      });

      // Customers listesini yenile
      queryClient.invalidateQueries({ queryKey: ["customers-select"] });
      
      toast({
        title: "Başarılı",
        description: "Yeni müşteri eklendi ve seçildi",
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Hata",
        description: "Müşteri oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCustomerData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Hata",
        description: "Fırsat başlığı gereklidir",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("opportunities")
        .insert({
          title: formData.title,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          value: formData.value ? parseFloat(formData.value) : 0,
          currency: formData.currency,
          customer_id: formData.customer_id || null,
        });

      if (error) throw error;

      // Refresh opportunities data
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      
      toast({
        title: "Başarılı",
        description: "Yeni fırsat başarıyla oluşturuldu",
      });

      // Reset form and close
      setFormData({
        title: "",
        customer_id: "",
        value: "",
        currency: "TRY",
        status: "new",
        priority: "medium",
        description: ""
      });
      setCustomerPopoverOpen(false);
      setShowNewCustomerForm(false);
      setNewCustomerData({
        company: "",
        name: "",
        email: "",
        phone: "",
        city: "",
        address: ""
      });
      onClose();
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast({
        title: "Hata",
        description: "Fırsat oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <Label htmlFor="customer_id">Müşteri</Label>
            <Popover open={customerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerPopoverOpen}
                  className={cn(
                    "w-full justify-between",
                    !formData.customer_id && "text-muted-foreground"
                  )}
                  disabled={customersLoading}
                >
                  {selectedCustomer
                    ? selectedCustomer.company 
                      ? `${selectedCustomer.name} (${selectedCustomer.company})`
                      : selectedCustomer.name
                    : "Müşteri ara..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Müşteri ara..." />
                  
                  {/* Yeni Müşteri Ekle Bölümü - En Üstte */}
                  <div className="border-b pb-2">
                    {!showNewCustomerForm ? (
                      <CommandItem
                        onSelect={() => setShowNewCustomerForm(true)}
                        className="hover:bg-muted/50 transition-colors cursor-pointer text-primary"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="font-medium">Yeni Müşteri Ekle</span>
                      </CommandItem>
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-md space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Yeni Müşteri Bilgileri</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowNewCustomerForm(false)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="company" className="text-xs">Şirket Adı *</Label>
                              <Input
                                id="company"
                                name="company"
                                value={newCustomerData.company}
                                onChange={handleNewCustomerChange}
                                placeholder="Şirket adı"
                                className="h-8 text-xs"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="name" className="text-xs">İletişim Kişisi *</Label>
                              <Input
                                id="name"
                                name="name"
                                value={newCustomerData.name}
                                onChange={handleNewCustomerChange}
                                placeholder="Ad soyad"
                                className="h-8 text-xs"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="email" className="text-xs">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={newCustomerData.email}
                                onChange={handleNewCustomerChange}
                                placeholder="email@example.com"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone" className="text-xs">Telefon</Label>
                              <Input
                                id="phone"
                                name="phone"
                                value={newCustomerData.phone}
                                onChange={handleNewCustomerChange}
                                placeholder="05xx xxx xx xx"
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="city" className="text-xs">Şehir</Label>
                              <Input
                                id="city"
                                name="city"
                                value={newCustomerData.city}
                                onChange={handleNewCustomerChange}
                                placeholder="İstanbul"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Label htmlFor="address" className="text-xs">Adres</Label>
                              <Input
                                id="address"
                                name="address"
                                value={newCustomerData.address}
                                onChange={handleNewCustomerChange}
                                placeholder="Kısa adres"
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={isCreatingCustomer}
                              className="flex-1 h-8 text-xs"
                              onClick={handleNewCustomerSubmit}
                            >
                              {isCreatingCustomer ? "Ekleniyor..." : "Kaydet"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowNewCustomerForm(false)}
                              className="h-8 text-xs"
                            >
                              İptal
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CommandList>
                    <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {customers?.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={`${customer.name} ${customer.company || ''}`}
                          onSelect={() => handleCustomerSelect(customer.id)}
                          data-selected={formData.customer_id === customer.id}
                          className="hover:bg-muted/50 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent-foreground transition-colors cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.customer_id === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name}</span>
                            {customer.company && (
                              <span className="text-sm text-muted-foreground">{customer.company}</span>
                            )}
                            {customer.email && (
                              <span className="text-xs text-muted-foreground">{customer.email}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="value">Tahmini Değer</Label>
              <Input 
                id="value" 
                name="value" 
                type="number" 
                step="0.01"
                value={formData.value} 
                onChange={handleChange} 
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="currency">Para Birimi</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Para birimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">TRY (₺)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
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
                  <SelectItem value="new">Yeni</SelectItem>
                  <SelectItem value="first_contact">İlk İletişim</SelectItem>
                  <SelectItem value="site_visit">Saha Ziyareti</SelectItem>
                  <SelectItem value="preparing_proposal">Teklif Hazırlanıyor</SelectItem>
                  <SelectItem value="proposal_sent">Teklif Gönderildi</SelectItem>
                  <SelectItem value="accepted">Kabul Edildi</SelectItem>
                  <SelectItem value="lost">Kaybedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Öncelik</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityForm;