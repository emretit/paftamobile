
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { Customer } from "@/types/customer";
import { Supplier } from "@/types/supplier";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface CustomerSelectProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomer: Customer | undefined;
  selectedSupplier: Supplier | undefined;
  customers: Customer[] | undefined;
  suppliers: Supplier[] | undefined;
  onSelectCustomer: (customerId: string) => void;
  onSelectSupplier: (supplierId: string) => void;
  type: "customer" | "supplier";
  onTypeChange: (type: "customer" | "supplier") => void;
}

const CustomerSelect = ({ 
  isOpen, 
  onOpenChange, 
  selectedCustomer,
  selectedSupplier,
  customers, 
  suppliers,
  onSelectCustomer,
  onSelectSupplier,
  type,
  onTypeChange
}: CustomerSelectProps) => {
  const navigate = useNavigate();
  
  const getDisplayName = () => {
    if (type === "customer" && selectedCustomer) {
      return selectedCustomer.name;
    }
    if (type === "supplier" && selectedSupplier) {
      return selectedSupplier.name;
    }
    return type === "customer" ? "Müşteri seçin..." : "Tedarikçi seçin...";
  };

  const handleCreateNew = () => {
    navigate(type === "customer" ? "/contacts/new" : "/suppliers/new");
  };

  return (
    <div className="space-y-2">
      <Label>İş Ortağı</Label>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
          >
            {getDisplayName()}
            <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Tabs defaultValue={type} onValueChange={(value) => onTypeChange(value as "customer" | "supplier")}>
            <TabsList className="w-full">
              <TabsTrigger value="customer" className="flex-1">Müşteriler</TabsTrigger>
              <TabsTrigger value="supplier" className="flex-1">Tedarikçiler</TabsTrigger>
            </TabsList>
            <Command>
              <CommandInput placeholder={`${type === "customer" ? "Müşteri" : "Tedarikçi"} ara...`} />
              <CommandList>
                <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                <CommandGroup>
                  {type === "customer" ? (
                    customers?.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        onSelect={() => {
                          onSelectCustomer(customer.id);
                          onOpenChange(false);
                        }}
                        className="flex flex-col items-start"
                      >
                        <div className="font-medium">{customer.name}</div>
                        {customer.company && (
                          <div className="text-sm text-muted-foreground">
                            {customer.company}
                          </div>
                        )}
                        {customer.email && (
                          <div className="text-xs text-muted-foreground">
                            {customer.email}
                          </div>
                        )}
                      </CommandItem>
                    ))
                  ) : (
                    suppliers?.map((supplier) => (
                      <CommandItem
                        key={supplier.id}
                        onSelect={() => {
                          onSelectSupplier(supplier.id);
                          onOpenChange(false);
                        }}
                        className="flex flex-col items-start"
                      >
                        <div className="font-medium">{supplier.name}</div>
                        {supplier.company && (
                          <div className="text-sm text-muted-foreground">
                            {supplier.company}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="text-xs text-muted-foreground">
                            {supplier.email}
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
                    <span>Yeni {type === "customer" ? "Müşteri" : "Tedarikçi"} Ekle</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Tabs>
        </PopoverContent>
      </Popover>
      
      {/* Display selected partner details */}
      {(selectedCustomer || selectedSupplier) && (
        <div className="mt-4 space-y-2 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-medium">İş Ortağı Bilgileri</h3>
          {type === "customer" && selectedCustomer && (
            <>
              {selectedCustomer.company && (
                <p className="text-sm">
                  <span className="font-medium">Firma:</span> {selectedCustomer.company}
                </p>
              )}
              {selectedCustomer.representative && (
                <p className="text-sm">
                  <span className="font-medium">Temsilci:</span> {selectedCustomer.representative}
                </p>
              )}
              {selectedCustomer.email && (
                <p className="text-sm">
                  <span className="font-medium">E-posta:</span> {selectedCustomer.email}
                </p>
              )}
              {(selectedCustomer.mobile_phone || selectedCustomer.office_phone) && (
                <p className="text-sm">
                  <span className="font-medium">Telefon:</span>{" "}
                  {selectedCustomer.mobile_phone || selectedCustomer.office_phone}
                </p>
              )}
              {selectedCustomer.address && (
                <p className="text-sm">
                  <span className="font-medium">Adres:</span> {selectedCustomer.address}
                </p>
              )}
            </>
          )}
          {type === "supplier" && selectedSupplier && (
            <>
              {selectedSupplier.company && (
                <p className="text-sm">
                  <span className="font-medium">Firma:</span> {selectedSupplier.company}
                </p>
              )}
              {selectedSupplier.representative && (
                <p className="text-sm">
                  <span className="font-medium">Temsilci:</span> {selectedSupplier.representative}
                </p>
              )}
              {selectedSupplier.email && (
                <p className="text-sm">
                  <span className="font-medium">E-posta:</span> {selectedSupplier.email}
                </p>
              )}
              {(selectedSupplier.mobile_phone || selectedSupplier.office_phone) && (
                <p className="text-sm">
                  <span className="font-medium">Telefon:</span>{" "}
                  {selectedSupplier.mobile_phone || selectedSupplier.office_phone}
                </p>
              )}
              {selectedSupplier.address && (
                <p className="text-sm">
                  <span className="font-medium">Adres:</span> {selectedSupplier.address}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSelect;
