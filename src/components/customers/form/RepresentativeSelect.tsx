
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";
import { Employee } from "@/components/employees/types";

interface RepresentativeSelectProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const RepresentativeSelect = ({ formData, setFormData }: RepresentativeSelectProps) => {
  const [open, setOpen] = useState(false);

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log('Çalışanlar verisi çekiliyor...');
      // Status filtresini kaldırıp tüm çalışanları çekelim
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('first_name');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Çekilen çalışanlar ve durumları:', data?.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        status: emp.status
      })));
      
      // Aktif çalışanları filtreleyelim ('aktif' veya diğer olası değerler)
      const activeEmployees = data?.filter(emp => 
        emp.status?.toLowerCase() === 'aktif' || 
        emp.status?.toLowerCase() === 'active'
      );

      console.log('Aktif çalışanlar:', activeEmployees);
      return activeEmployees as Employee[];
    }
  });

  if (error) {
    console.error('Query error:', error);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="representative">Temsilci</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                {formData.representative || "Temsilci seçin..."}
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Temsilci ara..." />
            <CommandList>
              <CommandEmpty>Temsilci bulunamadı.</CommandEmpty>
              <CommandGroup>
                {employees?.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    onSelect={() => {
                      const fullName = `${employee.first_name} ${employee.last_name}`;
                      setFormData({ ...formData, representative: fullName });
                      setOpen(false);
                    }}
                    className="flex flex-col items-start"
                  >
                    <div className="font-medium">{`${employee.first_name} ${employee.last_name}`}</div>
                    <div className="text-sm text-muted-foreground">{employee.department}</div>
                    {employee.email && (
                      <div className="text-xs text-muted-foreground">{employee.email}</div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RepresentativeSelect;

