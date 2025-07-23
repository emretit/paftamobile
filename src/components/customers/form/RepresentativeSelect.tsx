
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { CustomerFormData } from "@/types/customer";

interface RepresentativeOption {
  id: string;
  name: string;
}

interface RepresentativeSelectProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const RepresentativeSelect = ({ formData, setFormData }: RepresentativeSelectProps) => {
  const [representatives, setRepresentatives] = useState<RepresentativeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRepresentatives = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, first_name, last_name")
          .eq("status", "aktif");

        if (error) {
          throw error;
        }

        const formattedData = data.map(rep => ({
          id: rep.id,
          name: `${rep.first_name} ${rep.last_name}`
        }));

        setRepresentatives(formattedData);
      } catch (error) {
        console.error("Error fetching representatives:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepresentatives();
  }, []);

  const handleChange = (value: string) => {
    setFormData({
      ...formData,
      representative: value
    });
  };

  return (
    <div className="space-y-2">
      <Label>Temsilci</Label>
      <Select
        disabled={isLoading}
        value={formData.representative ?? ""}
        onValueChange={handleChange}
      >
        <SelectTrigger>
          <SelectValue 
            placeholder="Temsilci seçiniz"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Seçilmedi</SelectItem>
          {representatives.map((rep) => (
            <SelectItem key={rep.id} value={rep.id}>
              {rep.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RepresentativeSelect;
