
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";
import BasicInformation from "./form/BasicInformation";
import CustomerTypeAndStatus from "./form/CustomerTypeAndStatus";
import CompanyInformation from "./form/CompanyInformation";
import RepresentativeSelect from "./form/RepresentativeSelect";

interface CustomerFormFieldsProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const CustomerFormFields = ({ formData, setFormData }: CustomerFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <BasicInformation formData={formData} setFormData={setFormData} />
      <CustomerTypeAndStatus formData={formData} setFormData={setFormData} />
      <RepresentativeSelect formData={formData} setFormData={setFormData} />

      <div className="space-y-2">
        <Label htmlFor="address">Adres</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <CompanyInformation formData={formData} setFormData={setFormData} />

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
