
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Building, MapPin, FileText, User, Users, Edit3, Save, X, Check } from "lucide-react";
import { Customer } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

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

  const handleSave = async () => {
    if (required && !editValue.trim()) {
      toast({
        title: "Hata",
        description: "Bu alan zorunludur",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editValue);
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
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isEditing && !value) {
    return (
      <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <div className="flex items-center space-x-3 text-gray-500">
          {icon}
          <span className="text-sm">{placeholder || `${label} ekle`}</span>
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
      <Label className="text-sm font-medium text-muted-foreground flex items-center">
        {icon}
        <span className="ml-1">{label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {isEditing ? (
        <div className="space-y-2">
          {multiline ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              rows={3}
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
        <div className="flex items-center justify-between group">
          <div className="flex items-center space-x-3">
            {icon}
            <span className="font-medium">{value}</span>
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

export const ContactInfo = ({ customer, onUpdate }: ContactInfoProps) => {
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
        <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <div className="flex items-center space-x-3 text-gray-500">
            <Users className="w-4 h-4" />
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
        <Label className="text-sm font-medium text-muted-foreground flex items-center">
          <Users className="w-4 h-4 mr-1" />
          Temsilci
        </Label>
        
        {isEditing ? (
          <div className="space-y-2">
            <Select value={selectedRep} onValueChange={setSelectedRep}>
              <SelectTrigger>
                <SelectValue placeholder="Temsilci seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seçilmedi</SelectItem>
                {employees.map((employee) => (
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
          <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 text-muted-foreground" />
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
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <User className="w-4 h-4 mr-2 text-muted-foreground" />
          İletişim Bilgileri
        </h2>
        
        <div className="space-y-4">
          <EditableField
            label="Yetkili Kişi"
            value={customer.name || ""}
            icon={<User className="w-3.5 h-3.5 text-muted-foreground" />}
            onSave={(value) => updateCustomerField("name", value)}
            placeholder="Yetkili kişi adı"
            required
          />

          <EditableField
            label="E-posta"
            value={customer.email || ""}
            icon={<Mail className="w-3.5 h-3.5 text-muted-foreground" />}
            onSave={(value) => updateCustomerField("email", value)}
            placeholder="ornek@email.com"
            type="email"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Cep Telefonu"
              value={customer.mobile_phone || ""}
              icon={<Phone className="w-3.5 h-3.5 text-muted-foreground" />}
              onSave={(value) => updateCustomerField("mobile_phone", value)}
              placeholder="+90 5XX XXX XX XX"
              type="tel"
            />

            <EditableField
              label="İş Telefonu"
              value={customer.office_phone || ""}
              icon={<Phone className="w-3.5 h-3.5 text-muted-foreground" />}
              onSave={(value) => updateCustomerField("office_phone", value)}
              placeholder="+90 2XX XXX XX XX"
              type="tel"
            />
          </div>

          {customer.type === 'kurumsal' && (
            <EditableField
              label="Şirket"
              value={customer.company || ""}
              icon={<Building className="w-3.5 h-3.5 text-muted-foreground" />}
              onSave={(value) => updateCustomerField("company", value)}
              placeholder="Şirket adı"
            />
          )}

          <RepresentativeField />

          <EditableField
            label="Adres"
            value={customer.address || ""}
            icon={<MapPin className="w-3.5 h-3.5 text-muted-foreground" />}
            onSave={(value) => updateCustomerField("address", value)}
            placeholder="Tam adres bilgisi"
            multiline
          />
        </div>
      </Card>

      {customer.type === 'kurumsal' && (customer.tax_number || customer.tax_office) && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
            Vergi Bilgileri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Vergi Numarası"
              value={customer.tax_number || ""}
              icon={<FileText className="w-3.5 h-3.5 text-muted-foreground" />}
              onSave={(value) => updateCustomerField("tax_number", value)}
              placeholder="1234567890"
            />

            <EditableField
              label="Vergi Dairesi"
              value={customer.tax_office || ""}
              icon={<Building className="w-3.5 h-3.5 text-muted-foreground" />}
              onSave={(value) => updateCustomerField("tax_office", value)}
              placeholder="Vergi dairesi adı"
            />
          </div>
        </Card>
      )}
    </div>
  );
};
