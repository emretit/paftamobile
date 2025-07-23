
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerFormData } from "@/types/customer";
import BasicInformation from "./form/BasicInformation";
import CustomerTypeAndStatus from "./form/CustomerTypeAndStatus";
import CompanyInformation from "./form/CompanyInformation";
import RepresentativeSelect from "./form/RepresentativeSelect";
import { MapPin, DollarSign } from "lucide-react";

interface CustomerFormFieldsProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const CustomerFormFields = ({ formData, setFormData }: CustomerFormFieldsProps) => {
  return (
    <div className="space-y-3">
      {/* Basic Info Section */}
      <div className="p-3 bg-card rounded-lg border border-border/50">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full"></div>
          Temel Bilgiler
        </h3>
        <BasicInformation formData={formData} setFormData={setFormData} />
      </div>

      {/* Type and Status */}
      <div className="p-3 bg-card rounded-lg border border-border/50">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
          Tip ve Durum
        </h3>
        <CustomerTypeAndStatus formData={formData} setFormData={setFormData} />
      </div>

      {/* Representative */}
      <div className="p-3 bg-card rounded-lg border border-border/50">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
          Temsilci
        </h3>
        <RepresentativeSelect formData={formData} setFormData={setFormData} />
      </div>

      {/* Address */}
      <div className="p-3 bg-card rounded-lg border border-border/50">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-rose-500 rounded-full"></div>
          Adres Bilgileri
        </h3>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-500" />
            <span>Tam Adres</span>
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Tam adres bilgisi"
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      {/* Company Information (only for corporate) */}
      <CompanyInformation formData={formData} setFormData={setFormData} />

      {/* Financial Info */}
      <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
        <h3 className="text-sm font-medium text-emerald-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
          Finansal Bilgiler
        </h3>
        <div className="space-y-2">
          <Label htmlFor="balance" className="text-sm font-medium text-emerald-700 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-600" />
            <span>Başlangıç Bakiyesi</span>
          </Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="bg-white/70"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerFormFields;
