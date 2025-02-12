
import { Input } from "@/components/ui/input";
import { CustomerFormData } from "@/types/customer";

interface CustomerFormFieldsProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const CustomerFormFields = ({ formData, setFormData }: CustomerFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Müşteri Adı</label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">E-posta</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cep Telefonu</label>
        <Input
          value={formData.mobile_phone}
          onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sabit Telefon</label>
        <Input
          value={formData.office_phone}
          onChange={(e) => setFormData({ ...formData, office_phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Şirket</label>
        <Input
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tip</label>
        <select
          className="w-full border rounded-md h-10 px-3"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as "bireysel" | "kurumsal" })}
        >
          <option value="bireysel">Bireysel</option>
          <option value="kurumsal">Kurumsal</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Durum</label>
        <select
          className="w-full border rounded-md h-10 px-3"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as "aktif" | "pasif" | "potansiyel" })}
        >
          <option value="aktif">Aktif</option>
          <option value="pasif">Pasif</option>
          <option value="potansiyel">Potansiyel</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Temsilci</label>
        <Input
          value={formData.representative}
          onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Adres</label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bakiye</label>
        <Input
          type="number"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
        />
      </div>
    </div>
  );
};

export default CustomerFormFields;
