
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Employee } from "../../../types";

interface AddressFieldsProps {
  formData: Partial<Employee>;
  handleInputChange?: (field: string, value: string) => void;
  isEditing?: boolean;
}

export const AddressFields = ({
  formData,
  handleInputChange,
  isEditing = false
}: AddressFieldsProps) => {
  return (
    <>
      <h4 className="text-lg font-medium text-gray-700 mt-8 mb-4">Adres Bilgileri</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Adres</Label>
          {isEditing ? (
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange?.('address', e.target.value)}
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.address || '-'}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Şehir</Label>
          {isEditing ? (
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => handleInputChange?.('city', e.target.value)}
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.city || '-'}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Posta Kodu</Label>
          {isEditing ? (
            <Input
              id="postal_code"
              value={formData.postal_code || ''}
              onChange={(e) => handleInputChange?.('postal_code', e.target.value)}
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.postal_code || '-'}</div>
          )}
        </div>
      </div>
    </>
  );
};
