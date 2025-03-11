
import { useState, useEffect } from "react";
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
import type { EmployeeFormData } from "./types";
import { GENDERS, MARITAL_STATUS } from "./types";

interface ExtendedPersonalInfoProps {
  formData: EmployeeFormData;
  onFormChange: (field: keyof EmployeeFormData, value: string) => void;
  errors: Record<string, string>;
}

// Define country data
const COUNTRIES = ["Turkey", "United States", "Germany", "United Kingdom", "France"];

export const ExtendedPersonalInfo = ({ formData, onFormChange, errors }: ExtendedPersonalInfoProps) => {
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  // Example city data - in a real app, this would typically come from an API based on country selection
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
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Extended Personal Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth || ""}
            onChange={(e) => onFormChange('date_of_birth', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="id_ssn">ID/SSN</Label>
          <Input
            id="id_ssn"
            value={formData.id_ssn || ""}
            onChange={(e) => onFormChange('id_ssn', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender || ""}
            onValueChange={(value) => onFormChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marital_status">Marital Status</Label>
          <Select
            value={formData.marital_status || ""}
            onValueChange={(value) => onFormChange('marital_status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              {MARITAL_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Address Information</h2>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address || ""}
          onChange={(e) => onFormChange('address', e.target.value)}
          className="min-h-[80px]"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={formData.country || ""}
            onValueChange={(value) => {
              onFormChange('country', value);
              // Reset city and district when country changes
              onFormChange('city', '');
              onFormChange('district', '');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Select
            value={formData.city || ""}
            onValueChange={(value) => {
              onFormChange('city', value);
              // Reset district when city changes
              onFormChange('district', '');
            }}
            disabled={!formData.country}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.country ? "Select city" : "Select country first"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Select
            value={formData.district || ""}
            onValueChange={(value) => onFormChange('district', value)}
            disabled={!formData.city}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.city ? "Select district" : "Select city first"} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={formData.postal_code || ""}
            onChange={(e) => onFormChange('postal_code', e.target.value)}
          />
        </div>
      </div>
    </>
  );
};
