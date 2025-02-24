
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees-select'],
    queryFn: async () => {
      console.log('Fetching employees...');
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department, status')
        .order('first_name');
      
      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      console.log('Employees data:', data);
      return data;
    }
  });

  const employees = data || [];
  console.log('Current employees state:', employees);

  const activeEmployees = employees.filter(emp => emp?.status === 'active') || [];
  console.log('Active employees:', activeEmployees);

  const filteredEmployees = search === "" 
    ? activeEmployees 
    : activeEmployees.filter((employee) => {
        if (!employee) return false;
        const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
        const department = (employee.department || '').toLowerCase();
        const searchTerm = search.toLowerCase();
        return fullName.includes(searchTerm) || department.includes(searchTerm);
      });

  console.log('Filtered employees:', filteredEmployees);

  if (error) {
    console.error('Representative select error:', error);
    return (
      <div className="space-y-2">
        <Label htmlFor="representative">Temsilci</Label>
        <div className="text-sm text-red-500">Çalışan listesi yüklenirken bir hata oluştu.</div>
      </div>
    );
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
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {formData.representative || "Temsilci seçin..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Temsilci ara..."
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandEmpty className="py-6 text-center text-sm">
              {isLoading ? "Yükleniyor..." : "Temsilci bulunamadı"}
            </CommandEmpty>
            {filteredEmployees.length > 0 && (
              <CommandGroup className="max-h-[300px] overflow-y-auto p-1">
                {filteredEmployees.map((employee) => {
                  if (!employee) return null;
                  const fullName = `${employee.first_name} ${employee.last_name}`;
                  return (
                    <CommandItem
                      key={employee.id}
                      onSelect={() => {
                        setFormData({ ...formData, representative: fullName });
                        setOpen(false);
                      }}
                      value={fullName}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.representative === fullName ? "opacity-100" : "opacity-0"
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
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RepresentativeSelect;
