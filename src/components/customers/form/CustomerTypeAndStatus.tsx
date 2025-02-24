
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerFormData } from "@/types/customer";

interface CustomerTypeAndStatusProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const CustomerTypeAndStatus = ({ formData, setFormData }: CustomerTypeAndStatusProps) => {
  return (
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
  );
};

export default CustomerTypeAndStatus;
