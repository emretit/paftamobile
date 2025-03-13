
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Building2, Plus, Phone, Mail, MapPin } from "lucide-react";
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
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ProposalPartnerSelectProps {
  partnerType: "customer" | "supplier";
}

const ProposalPartnerSelect = ({ partnerType }: ProposalPartnerSelectProps) => {
  const navigate = useNavigate();
  const { setValue, watch } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  
  const customerId = watch("customer_id");
  const supplierId = watch("supplier_id");
  
  const { customers, suppliers, isLoading } = useCustomerSelect();
  
  const selectedCustomer = customers?.find(c => c.id === customerId);
  const selectedSupplier = suppliers?.find(s => s.id === supplierId);
  
  const handleSelectPartner = (id: string) => {
    if (partnerType === "customer") {
      setValue("customer_id", id);
      setValue("supplier_id", "");
    } else {
      setValue("supplier_id", id);
      setValue("customer_id", "");
    }
    setIsOpen(false);
  };
  
  const handleCreateNew = () => {
    navigate(partnerType === "customer" ? "/contacts/new" : "/suppliers/new");
  };
  
  const getDisplayName = () => {
    if (partnerType === "customer" && selectedCustomer) {
      return selectedCustomer.name;
    }
    if (partnerType === "supplier" && selectedSupplier) {
      return selectedSupplier.name;
    }
    return partnerType === "customer" ? "Müşteri seçin..." : "Tedarikçi seçin...";
  };

  const selectedPartner = partnerType === "customer" ? selectedCustomer : selectedSupplier;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">
          {partnerType === "customer" ? "Müşteri" : "Tedarikçi"}
        </Label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between mt-1"
            >
              <div className="flex items-center">
                {partnerType === "customer" ? (
                  <User className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                ) : (
                  <Building2 className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                )}
                {getDisplayName()}
              </div>
              <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput 
                placeholder={`${partnerType === "customer" ? "Müşteri" : "Tedarikçi"} ara...`} 
              />
              <CommandList>
                <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                <CommandGroup>
                  {isLoading ? (
                    <CommandItem disabled>Yükleniyor...</CommandItem>
                  ) : (
                    (partnerType === "customer" ? customers : suppliers)?.map((partner) => (
                      <CommandItem
                        key={partner.id}
                        onSelect={() => handleSelectPartner(partner.id)}
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
                    ))
                  )}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreateNew}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Yeni {partnerType === "customer" ? "Müşteri" : "Tedarikçi"} Ekle</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedPartner && (
        <Card className="bg-muted/40">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">{selectedPartner.name}</h3>
                {selectedPartner.company && (
                  <span className="text-sm text-muted-foreground">{selectedPartner.company}</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {selectedPartner.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedPartner.email}</span>
                  </div>
                )}
                {selectedPartner.mobile_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedPartner.mobile_phone}</span>
                  </div>
                )}
                {selectedPartner.address && (
                  <div className="flex items-center col-span-2">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedPartner.address}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProposalPartnerSelect;
