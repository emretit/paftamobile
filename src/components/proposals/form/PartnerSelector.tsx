
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Customer } from "@/types/customer";
import { Supplier } from "@/types/supplier";

interface PartnerSelectorProps {
  type: "customer" | "supplier";
  partners: Customer[] | Supplier[] | undefined;
  onSelectPartner: (id: string) => void;
  onClose: () => void;
}

const PartnerSelector = ({ type, partners, onSelectPartner, onClose }: PartnerSelectorProps) => {
  const navigate = useNavigate();
  
  const handleCreateNew = () => {
    navigate(type === "customer" ? "/contacts/new" : "/suppliers/new");
  };
  
  return (
    <Command>
      <CommandInput placeholder={`${type === "customer" ? "Müşteri" : "Tedarikçi"} ara...`} />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
        <CommandGroup>
          {partners?.map((partner) => (
            <CommandItem
              key={partner.id}
              onSelect={() => {
                onSelectPartner(partner.id);
                onClose();
              }}
              className="flex flex-col items-start"
            >
              <div className="font-medium">{partner.name}</div>
              {partner.company && (
                <div className="text-sm text-muted-foreground">
                  {partner.company}
                </div>
              )}
              {partner.email && (
                <div className="text-xs text-muted-foreground">
                  {partner.email}
                </div>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandItem
            onSelect={handleCreateNew}
            className="text-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Yeni {type === "customer" ? "Müşteri" : "Tedarikçi"} Ekle</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default PartnerSelector;
