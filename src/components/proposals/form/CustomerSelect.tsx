
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Customer } from "@/types/customer";

interface CustomerSelectProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomer: Customer | undefined;
  customers: Customer[] | undefined;
  onSelect: (customerId: string) => void;
}

const CustomerSelect = ({ 
  isOpen, 
  onOpenChange, 
  selectedCustomer, 
  customers, 
  onSelect 
}: CustomerSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Müşteri</Label>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
          >
            {selectedCustomer ? selectedCustomer.name : "Müşteri seçin..."}
            <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Müşteri ara..." />
            <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
            <CommandGroup>
              {customers?.map((customer) => (
                <CommandItem
                  key={customer.id}
                  onSelect={() => {
                    onSelect(customer.id);
                    onOpenChange(false);
                  }}
                >
                  <span>{customer.name}</span>
                  {customer.company && (
                    <span className="ml-2 text-gray-500">
                      ({customer.company})
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomerSelect;
