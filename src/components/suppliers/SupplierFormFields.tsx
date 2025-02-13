
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SupplierFormData } from "@/types/supplier";

interface SupplierFormFieldsProps {
  formData: SupplierFormData;
  setFormData: React.Dispatch<React.SetStateAction<SupplierFormData>>;
}

const SupplierFormFields = ({ formData, setFormData }: SupplierFormFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">İsim Soyisim</Label>
          <Input
            id="name"
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

        <div className="space-y-2">
          <Label htmlFor="company">Firma Adı</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Türü</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "bireysel" | "kurumsal") =>
              setFormData({ ...formData, type: value })
            }
          >
            <SelectTrigger>
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="pasif">Pasif</SelectItem>
              <SelectItem value="potansiyel">Potansiyel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="representative">Temsilci</Label>
          <Input
            id="representative"
            value={formData.representative}
            onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="balance">Bakiye</Label>
          <Input
            id="balance"
            type="number"
            value={formData.balance}
            onChange={(e) =>
              setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        {formData.type === "kurumsal" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="tax_number">Vergi Numarası</Label>
              <Input
                id="tax_number"
                value={formData.tax_number}
                onChange={(e) =>
                  setFormData({ ...formData, tax_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_office">Vergi Dairesi</Label>
              <Input
                id="tax_office"
                value={formData.tax_office}
                onChange={(e) =>
                  setFormData({ ...formData, tax_office: e.target.value })
                }
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adres</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
        />
      </div>
    </>
  );
};

export default SupplierFormFields;
