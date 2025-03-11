
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee } from "../../../types";

interface AddressFieldsProps {
  formData: Partial<Employee>;
  handleInputChange?: (field: string, value: string) => void;
  isEditing?: boolean;
}

// Define country data
const COUNTRIES = ["Turkey", "United States", "Germany", "United Kingdom", "France"];

export const AddressFields = ({
  formData,
  handleInputChange,
  isEditing = false
}: AddressFieldsProps) => {
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  // Example city data based on country selection
  useEffect(() => {
    if (formData.country === "Turkey") {
      setCities(["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"]);
    } else if (formData.country === "United States") {
      setCities(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]);
    } else {
      setCities([]);
    }
  }, [formData.country]);

  // Example district data based on city selection
  useEffect(() => {
    if (formData.city === "Istanbul") {
      setDistricts(["Besiktas", "Kadikoy", "Sisli", "Beyoglu", "Uskudar"]);
    } else if (formData.city === "Ankara") {
      setDistricts(["Cankaya", "Kecioren", "Yenimahalle", "Mamak", "Etimesgut"]);
    } else {
      setDistricts([]);
    }
  }, [formData.city]);

  return (
    <>
      <h4 className="text-lg font-medium text-gray-700 mt-8 mb-4">Adres Bilgileri</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Adres</Label>
          {isEditing ? (
            <Textarea
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange?.('address', e.target.value)}
              className="min-h-[80px]"
            />
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.address || '-'}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Ülke</Label>
          {isEditing ? (
            <Select
              value={formData.country || ""}
              onValueChange={(value) => {
                handleInputChange?.('country', value);
                // Reset city and district when country changes
                handleInputChange?.('city', '');
                handleInputChange?.('district', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ülke seçin" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.country || '-'}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Şehir</Label>
          {isEditing ? (
            <Select
              value={formData.city || ""}
              onValueChange={(value) => {
                handleInputChange?.('city', value);
                // Reset district when city changes
                handleInputChange?.('district', '');
              }}
              disabled={!formData.country}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.country ? "Şehir seçin" : "Önce ülke seçin"} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.city || '-'}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">İlçe</Label>
          {isEditing ? (
            <Select
              value={formData.district || ""}
              onValueChange={(value) => handleInputChange?.('district', value)}
              disabled={!formData.city}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.city ? "İlçe seçin" : "Önce şehir seçin"} />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 bg-gray-50 rounded-md">{formData.district || '-'}</div>
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
