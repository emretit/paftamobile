
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Mail, Phone, Building, MapPin, FileText, User, Users, Edit3, Save, X, Check, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { Customer } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { formatPhoneNumber, getDigitsOnly } from "@/utils/phoneFormatter";

interface ContactInfoProps {
  customer: Customer;
  onUpdate?: (updatedCustomer: Customer) => void;
}

interface EditableFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  onSave: (value: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
}

const EditableField = ({ 
  label, 
  value, 
  icon, 
  onSave, 
  multiline = false, 
  placeholder,
  type = "text",
  required = false
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const isPhoneField = type === "tel";

  const handleSave = async () => {
    const finalValue = isPhoneField ? getDigitsOnly(editValue) : editValue.trim();
    
    if (required && !finalValue) {
      toast({
        title: "Hata",
        description: "Bu alan zorunludur",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(finalValue);
      setIsEditing(false);
      toast({
        title: "Başarılı",
        description: "Güncelleme başarılı",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Güncelleme sırasında hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const displayValue = isPhoneField && value ? formatPhoneNumber(value) : value;
    setEditValue(displayValue);
    setIsEditing(false);
  };

  if (!isEditing && !value) {
    return (
      <div className="flex items-center justify-between py-1 px-2 rounded border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center space-x-1 text-muted-foreground group-hover:text-primary">
          {icon}
          <span className="text-xs">{placeholder || `${label} ekle`}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-0.5">
        {icon}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </Label>
      {isEditing ? (
        <div className="space-y-1">
          {multiline ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full"
            />
          ) : isPhoneField ? (
            <PhoneInput
              value={editValue}
              onChange={setEditValue}
              placeholder={placeholder}
              className="w-full"
            />
          ) : (
            <Input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="w-full"
            />
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Kaydet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              İptal
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between group hover:bg-muted/30 p-1 rounded transition-colors">
          <div className="flex items-center space-x-1">
            {icon}
            <span className="font-medium">{isPhoneField && value ? formatPhoneNumber(value) : value}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const displayValue = isPhoneField && value ? formatPhoneNumber(value) : value;
              setEditValue(displayValue);
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export const ContactInfo = ({ customer, onUpdate }: ContactInfoProps) => {
  const [showSecondaryContact, setShowSecondaryContact] = useState(false);
  const { toast } = useToast();

  // Fetch employees for representative dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("status", "aktif")
        .order("first_name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const updateCustomerField = async (field: string, value: string) => {
    const { data, error } = await supabase
      .from("customers")
      .update({ [field]: value || null })
      .eq("id", customer.id)
      .select()
      .single();

    if (error) throw error;
    if (onUpdate && data) {
      onUpdate(data);
    }
  };

  const RepresentativeField = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRep, setSelectedRep] = useState(customer.representative || "");
    const [isLoading, setIsLoading] = useState(false);

    const getRepresentativeName = (repId: string | null) => {
      if (!repId || !employees) return "";
      const employee = employees.find((e) => e.id === repId);
      return employee ? `${employee.first_name} ${employee.last_name}` : "";
    };

    const handleSave = async () => {
      setIsLoading(true);
      try {
        await updateCustomerField("representative", selectedRep === "none" ? "" : selectedRep);
        setIsEditing(false);
        toast({
          title: "Başarılı",
          description: "Temsilci güncellendi",
        });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Temsilci güncellenirken hata oluştu",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const currentRepName = getRepresentativeName(customer.representative);

    if (!isEditing && !currentRepName) {
      return (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer group">
          <div className="flex items-center space-x-2 text-muted-foreground group-hover:text-primary">
            <Users className="w-3 h-3" />
            <span className="text-sm">Temsilci atayın</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Users className="w-3 h-3 text-indigo-500" />
          <span>Temsilci</span>
        </Label>
        {isEditing ? (
          <div className="space-y-1.5">
            <Select value={selectedRep} onValueChange={setSelectedRep}>
              <SelectTrigger>
                <SelectValue placeholder="Temsilci seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seçilmedi</SelectItem>
                {employees
                  .filter((employee) => employee.id && employee.id.trim() !== "")
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {isLoading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Kaydet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                İptal
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between group hover:bg-muted/30 p-2 rounded-lg transition-colors">
            <div className="flex items-center space-x-2">
              <Users className="w-3 h-3 text-indigo-500" />
              <span className="font-medium">{currentRepName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-2 bg-gradient-to-br from-background to-muted/20 border shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="p-1 bg-primary/10 rounded">
          <User className="w-3 h-3 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Genel Bilgiler</h2>
      </div>
      
      <div className="space-y-1.5">
        {/* Primary Contact Section */}
        <div className="p-3 bg-card rounded-lg border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <div className="w-0.5 h-3 bg-primary rounded-full"></div>
              İletişim Bilgileri
            </h3>
            {!showSecondaryContact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecondaryContact(true)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-3 h-3 mr-1" />
                İkinci Yetkili
              </Button>
            )}
          </div>
          
          {/* Compact Primary Contact */}
          <div className="space-y-2">
            <div className="space-y-3">
              {/* First Row: Company, Contact Person, Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <EditableField
                  label="Şirket"
                  value={customer.company || ""}
                  icon={<Building className="w-2 h-2 text-purple-500" />}
                  onSave={(value) => updateCustomerField("company", value)}
                  placeholder="Şirket adı"
                />
                <EditableField
                  label="Yetkili Kişi"
                  value={customer.name || ""}
                  icon={<User className="w-2 h-2 text-primary" />}
                  onSave={(value) => updateCustomerField("name", value)}
                  placeholder="Ad Soyad"
                  required
                />
                <EditableField
                  label="E-posta"
                  value={customer.email || ""}
                  icon={<Mail className="w-2 h-2 text-blue-500" />}
                  onSave={(value) => updateCustomerField("email", value)}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
              
              {/* Second Row: Phone Numbers & Representative */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <EditableField
                  label="Cep Telefonu"
                  value={customer.mobile_phone || ""}
                  icon={<Phone className="w-2 h-2 text-green-500" />}
                  onSave={(value) => updateCustomerField("mobile_phone", value)}
                  placeholder="5XX XXX XX XX"
                  type="tel"
                />
                <EditableField
                  label="İş Telefonu"
                  value={customer.office_phone || ""}
                  icon={<Phone className="w-2 h-2 text-orange-500" />}
                  onSave={(value) => updateCustomerField("office_phone", value)}
                  placeholder="2XX XXX XX XX"
                  type="tel"
                />
                <div>
                  <RepresentativeField />
                </div>
              </div>
            </div>

            {/* Secondary Contact - Show only when requested */}
            {showSecondaryContact && (
              <div className="pt-2 border-t border-dashed border-muted-foreground/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3 text-secondary" />
                    İkinci Yetkili
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecondaryContact(false)}
                    className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <EditableField
                    label="Ad Soyad"
                    value={customer.representative || ""}
                    icon={<User className="w-2 h-2 text-secondary" />}
                    onSave={(value) => updateCustomerField("representative", value)}
                    placeholder="İkinci yetkili"
                  />
                  <EditableField
                    label="E-posta"
                    value=""
                    icon={<Mail className="w-2 h-2 text-blue-400" />}
                    onSave={async (value) => {
                      console.log("İkinci yetkili e-posta:", value);
                    }}
                    placeholder="email@example.com"
                    type="email"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <EditableField
                      label="Cep"
                      value=""
                      icon={<Phone className="w-2 h-2 text-green-400" />}
                      onSave={async (value) => {
                        console.log("İkinci yetkili cep:", value);
                      }}
                      placeholder="5XX XXX XX XX"
                      type="tel"
                    />
                    <EditableField
                      label="İş Tel"
                      value=""
                      icon={<Phone className="w-2 h-2 text-orange-400" />}
                      onSave={async (value) => {
                        console.log("İkinci yetkili iş tel:", value);
                      }}
                      placeholder="2XX XXX XX XX"
                      type="tel"
                    />
                  </div>
                  <div></div>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Tax + Address Combined */}
        <div className="p-3 bg-card rounded-lg border border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <div className="w-0.5 h-3 bg-amber-500 rounded-full"></div>
            {customer.type === 'kurumsal' ? 'Vergi & Adres Bilgileri' : 'Adres Bilgileri'}
          </h3>
          
          {/* Tax Information for Corporate */}
          {customer.type === 'kurumsal' && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-500" />
                Vergi Bilgileri
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <EditableField
                  label="Vergi No"
                  value={customer.tax_number || ""}
                  icon={<FileText className="w-2.5 h-2.5 text-amber-500" />}
                  onSave={(value) => updateCustomerField("tax_number", value)}
                  placeholder="1234567890"
                />
                <EditableField
                  label="Vergi Dairesi"
                  value={customer.tax_office || ""}
                  icon={<Building className="w-2.5 h-2.5 text-amber-600" />}
                  onSave={(value) => updateCustomerField("tax_office", value)}
                  placeholder="Vergi dairesi"
                />
              </div>
            </div>
          )}
          
          {/* Address Information */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              Adres Bilgileri
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <EditableField
                  label="Ülke"
                  value="Türkiye"
                  icon={<MapPin className="w-2.5 h-2.5 text-rose-500" />}
                  onSave={async (value) => {
                    // TODO: Ülke seçimi için veritabanı güncellemesi
                    console.log("Ülke:", value);
                  }}
                  placeholder="Ülke seçiniz"
                />
                <EditableField
                  label="İl"
                  value=""
                  icon={<MapPin className="w-2.5 h-2.5 text-rose-600" />}
                  onSave={async (value) => {
                    // TODO: İl seçimi için veritabanı güncellemesi
                    console.log("İl:", value);
                  }}
                  placeholder="İl seçiniz"
                />
                <EditableField
                  label="İlçe"
                  value=""
                  icon={<MapPin className="w-2.5 h-2.5 text-rose-700" />}
                  onSave={async (value) => {
                    // TODO: İlçe seçimi için veritabanı güncellemesi
                    console.log("İlçe:", value);
                  }}
                  placeholder="İlçe seçiniz"
                />
              </div>
              <EditableField
                label="Detaylı Adres"
                value={customer.address || ""}
                icon={<MapPin className="w-2.5 h-2.5 text-rose-500" />}
                onSave={(value) => updateCustomerField("address", value)}
                placeholder="Mahalle, sokak, bina no, daire no vb."
                multiline
              />
            </div>
          </div>
        </div>

        {/* Financial Information - Ultra Compact */}
        <div className="p-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded border border-emerald-200">
          <h3 className="text-xs font-medium text-emerald-700 mb-1.5 flex items-center gap-1">
            <div className="w-0.5 h-2 bg-emerald-500 rounded-full"></div>
            Finansal
          </h3>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-1.5 bg-white/70 rounded border border-emerald-200">
              <div className="flex items-center gap-1">
                <div className="p-0.5 bg-emerald-100 rounded-full">
                  {customer.balance > 0 ? (
                    <TrendingUp className="w-2 h-2 text-emerald-600" />
                  ) : customer.balance < 0 ? (
                    <TrendingDown className="w-2 h-2 text-red-600" />
                  ) : (
                    <DollarSign className="w-2 h-2 text-gray-600" />
                  )}
                </div>
                <span className="font-medium text-xs text-gray-700">Bakiye</span>
              </div>
              <span className={`font-bold text-xs px-1 py-0.5 rounded ${
                customer.balance > 0 
                  ? 'text-emerald-700 bg-emerald-100' 
                  : customer.balance < 0 
                  ? 'text-red-700 bg-red-100' 
                  : 'text-gray-700 bg-gray-100'
              }`}>
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0
                }).format(customer.balance)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="text-center p-1.5 bg-white/70 rounded border border-emerald-200">
                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  <TrendingUp className="w-2 h-2 text-emerald-600" />
                  <div className="text-emerald-700 font-medium text-xs">Alacak</div>
                </div>
                <div className="font-bold text-xs text-emerald-800">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0
                  }).format(Math.max(0, customer.balance))}
                </div>
              </div>
              <div className="text-center p-1.5 bg-white/70 rounded border border-red-200">
                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  <TrendingDown className="w-2 h-2 text-red-600" />
                  <div className="text-red-700 font-medium text-xs">Borç</div>
                </div>
                <div className="font-bold text-xs text-red-800">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0
                  }).format(Math.abs(Math.min(0, customer.balance)))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* E-Fatura Alias - En Altta */}
        <div className="p-3 bg-card rounded-lg border border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <div className="w-0.5 h-3 bg-blue-500 rounded-full"></div>
            E-Fatura Bilgileri
          </h3>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3 text-blue-500" />
              E-Fatura Alias
            </h4>
            <EditableField
              label="E-Fatura Alias"
              value={customer.einvoice_alias_name || ""}
              icon={<FileText className="w-2.5 h-2.5 text-blue-500" />}
              onSave={(value) => updateCustomerField("einvoice_alias_name", value)}
              placeholder="urn:mail:defaultpk-cgbilgi-4-6-2-c-2@mersel.io"
            />
            {customer.einvoice_alias_name && (
              <p className="text-xs text-muted-foreground mt-1">
                E-fatura gönderimlerinde kullanılacak alias adresi
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
