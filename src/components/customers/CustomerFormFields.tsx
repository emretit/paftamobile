import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerFormData } from "@/types/customer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerFormFieldsProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const CustomerFormFields = ({ formData, setFormData }: CustomerFormFieldsProps) => {
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('first_name');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Müşteri Adı</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mobile_phone">Cep Telefonu</Label>
          <Input
            id="mobile_phone"
            value={formData.mobile_phone}
            onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="office_phone">Sabit Telefon</Label>
          <Input
            id="office_phone"
            value={formData.office_phone}
            onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Şirket</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tip</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "bireysel" | "kurumsal") =>
              setFormData({ ...formData, type: value })
            }
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bireysel">Bireysel</SelectItem>
              <SelectItem value="kurumsal">Kurumsal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Durum</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "aktif" | "pasif" | "potansiyel") =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="pasif">Pasif</SelectItem>
              <SelectItem value="potansiyel">Potansiyel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="representative">Temsilci</Label>
        <Select
          value={formData.representative || ""}
          onValueChange={(value) => setFormData({ ...formData, representative: value })}
        >
          <SelectTrigger id="representative">
            <SelectValue placeholder="Temsilci seçin" />
          </SelectTrigger>
          <SelectContent>
            {employees?.filter(emp => emp.status === 'aktif').map((employee) => (
              <SelectItem 
                key={employee.id} 
                value={`${employee.first_name} ${employee.last_name}`}
              >
                {employee.first_name} {employee.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adres</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      {formData.type === 'kurumsal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_number">Vergi Numarası</Label>
            <Input
              id="tax_number"
              required
              value={formData.tax_number}
              onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_office">Vergi Dairesi</Label>
            <Input
              id="tax_office"
              value={formData.tax_office}
              onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="balance">Bakiye</Label>
        <Input
          id="balance"
          type="number"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
        />
      </div>
    </div>
  );
};

export default CustomerFormFields;
