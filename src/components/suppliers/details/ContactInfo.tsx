
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Mail, Phone, Building, MapPin, FileText, User, Users, Edit3, Save, X, Check, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { Supplier } from "@/types/supplier";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber, getDigitsOnly } from "@/utils/phoneFormatter";
import { formatCurrency } from "@/lib/utils";

interface ContactInfoProps {
  supplier: Supplier;
  onUpdate?: (updatedSupplier: Supplier) => void;
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

export const ContactInfo = ({ supplier, onUpdate }: ContactInfoProps) => {
  const [showSecondaryContact, setShowSecondaryContact] = useState(false);
  const { toast } = useToast();

  const updateSupplierField = async (field: string, value: string) => {
    const { data, error } = await supabase
      .from("suppliers")
      .update({ [field]: value || null })
      .eq("id", supplier.id)
      .select()
      .single();

    if (error) throw error;
    if (onUpdate && data) {
      onUpdate(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Contact Information */}
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
                    label="Firma"
                    value={supplier.company || ""}
                    icon={<Building className="w-2 h-2 text-purple-500" />}
                    onSave={(value) => updateSupplierField("company", value)}
                    placeholder="Firma adı"
                  />
                  <EditableField
                    label="Yetkili Kişi"
                    value={supplier.name || ""}
                    icon={<User className="w-2 h-2 text-primary" />}
                    onSave={(value) => updateSupplierField("name", value)}
                    placeholder="Ad Soyad"
                    required
                  />
                  <EditableField
                    label="E-posta"
                    value={supplier.email || ""}
                    icon={<Mail className="w-2 h-2 text-blue-500" />}
                    onSave={(value) => updateSupplierField("email", value)}
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>
                
                {/* Second Row: Phone Numbers & Representative */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <EditableField
                    label="Cep Telefonu"
                    value={supplier.mobile_phone || ""}
                    icon={<Phone className="w-2 h-2 text-green-500" />}
                    onSave={(value) => updateSupplierField("mobile_phone", value)}
                    placeholder="5XX XXX XX XX"
                    type="tel"
                  />
                  <EditableField
                    label="İş Telefonu"
                    value={supplier.office_phone || ""}
                    icon={<Phone className="w-2 h-2 text-orange-500" />}
                    onSave={(value) => updateSupplierField("office_phone", value)}
                    placeholder="2XX XXX XX XX"
                    type="tel"
                  />
                  <EditableField
                    label="Temsilci"
                    value={supplier.representative || ""}
                    icon={<Users className="w-2 h-2 text-indigo-500" />}
                    onSave={(value) => updateSupplierField("representative", value)}
                    placeholder="Temsilci adı"
                  />
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
                      value=""
                      icon={<User className="w-2 h-2 text-secondary" />}
                      onSave={async (value) => {
                        console.log("İkinci yetkili:", value);
                      }}
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
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tax & Address Information */}
          <div className="p-3 bg-card rounded-lg border border-border/50">
            <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <div className="w-0.5 h-3 bg-amber-500 rounded-full"></div>
              Vergi & Adres Bilgileri
            </h3>
            
            <div className="space-y-3">
              {/* Tax Information for Corporate */}
              {supplier.type === "kurumsal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <EditableField
                    label="Vergi Numarası"
                    value={supplier.tax_number || ""}
                    icon={<FileText className="w-2 h-2 text-amber-500" />}
                    onSave={(value) => updateSupplierField("tax_number", value)}
                    placeholder="Vergi numarası"
                  />
                  <EditableField
                    label="Vergi Dairesi"
                    value={supplier.tax_office || ""}
                    icon={<Building className="w-2 h-2 text-amber-600" />}
                    onSave={(value) => updateSupplierField("tax_office", value)}
                    placeholder="Vergi dairesi"
                  />
                </div>
              )}
              
              {/* Address */}
              <EditableField
                label="Adres"
                value={supplier.address || ""}
                icon={<MapPin className="w-2 h-2 text-rose-500" />}
                onSave={(value) => updateSupplierField("address", value)}
                placeholder="Detaylı adres bilgisi"
                multiline
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Information */}
      <Card className="p-2 bg-gradient-to-br from-background to-muted/20 border shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="p-1 bg-emerald-500/10 rounded">
            <DollarSign className="w-3 h-3 text-emerald-500" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Finansal Bilgiler</h2>
        </div>
        
        <div className="p-3 bg-card rounded-lg border border-border/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-muted">
                {supplier.balance >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
              </div>
              <span className="text-sm text-muted-foreground">Bakiye</span>
            </div>
            <span className={`font-semibold ${supplier.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(supplier.balance)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
