import { useState } from "react";
import { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Building, User, Users, FileText, Calendar, Edit3, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface EditableContactInfoProps {
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
}

export const EditableContactInfo = ({ customer, onUpdate }: EditableContactInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: customer.name || "",
    representative: customer.representative || "",
  });
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

  // Get representative name
  const getRepresentativeName = (repId: string | null) => {
    if (!repId || !employees) return "-";
    const employee = employees.find((e) => e.id === repId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "-";
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .update({
          name: editData.name,
          representative: editData.representative === "none" ? null : editData.representative,
        })
        .eq("id", customer.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setIsEditing(false);
      toast({
        title: "Başarılı",
        description: "Müşteri bilgileri güncellendi.",
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Hata",
        description: "Müşteri bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: customer.name || "",
      representative: customer.representative || "",
    });
    setIsEditing(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-foreground flex items-center">
          <User className="w-5 h-5 mr-2 text-muted-foreground" />
          İletişim Bilgileri
        </h3>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Düzenle
          </Button>
        ) : (
          <div className="flex gap-2">
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
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <Save className="h-3.5 w-3.5" />
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yetkili Kişi */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground flex items-center">
            <User className="w-4 h-4 mr-1" />
            Yetkili Kişi
          </Label>
          {isEditing ? (
            <Input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Yetkili kişi adı"
              className="w-full"
            />
          ) : (
            <p className="text-foreground font-medium">{customer.name}</p>
          )}
        </div>

        {/* Email */}
        {customer.email && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              E-posta
            </Label>
            <p className="text-foreground">{customer.email}</p>
          </div>
        )}

        {/* Mobile Phone */}
        {customer.mobile_phone && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              Cep Telefonu
            </Label>
            <p className="text-foreground">{customer.mobile_phone}</p>
          </div>
        )}

        {/* Office Phone */}
        {customer.office_phone && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              İş Telefonu
            </Label>
            <p className="text-foreground">{customer.office_phone}</p>
          </div>
        )}

        {/* Company */}
        {customer.company && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center">
              <Building className="w-4 h-4 mr-1" />
              Şirket
            </Label>
            <p className="text-foreground">{customer.company}</p>
          </div>
        )}

        {/* Representative */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground flex items-center">
            <Users className="w-4 h-4 mr-1" />
            Temsilci
          </Label>
          {isEditing ? (
            <Select
              value={editData.representative || "none"}
              onValueChange={(value) => setEditData({ ...editData, representative: value === "none" ? "" : value })}
            >
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
          ) : (
            <p className="text-foreground">{getRepresentativeName(customer.representative)}</p>
          )}
        </div>

        {/* Address */}
        {customer.address && (
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Adres
            </Label>
            <p className="text-foreground">{customer.address}</p>
          </div>
        )}
      </div>

      {/* Tax Information for Corporate Customers */}
      {customer.type === "kurumsal" && (customer.tax_number || customer.tax_office) && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-md font-medium text-foreground flex items-center mb-4">
            <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
            Vergi Bilgileri
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customer.tax_number && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Vergi Numarası
                </Label>
                <p className="text-foreground">{customer.tax_number}</p>
              </div>
            )}
            {customer.tax_office && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Vergi Dairesi
                </Label>
                <p className="text-foreground">{customer.tax_office}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};