
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";

interface RepresentativeSelectProps {
  formData: CustomerFormData;
  setFormData: (value: CustomerFormData) => void;
}

const RepresentativeSelect = ({ formData, setFormData }: RepresentativeSelectProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(formData.representative || "");

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('first_name');
      
      if (error) throw error;
      return data;
    }
  });

  const activeEmployees = employees?.filter(emp => emp.status === 'active') || [];

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
            {value || "Temsilci seçin..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command value={value} onValueChange={setValue}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput 
                placeholder="Temsilci ara..." 
                className="h-9 flex-1"
              />
            </div>
            <CommandEmpty className="py-6 text-center text-sm">
              Temsilci bulunamadı.
            </CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto p-1">
              {!isLoading && activeEmployees.map((employee) => {
                const fullName = `${employee.first_name} ${employee.last_name}`;
                return (
                  <CommandItem
                    key={employee.id}
                    value={fullName}
                    onSelect={(currentValue) => {
                      setFormData({ ...formData, representative: currentValue });
                      setValue(currentValue);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === fullName ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{fullName}</span>
                      <span className="text-xs text-gray-500">{employee.department}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RepresentativeSelect;
