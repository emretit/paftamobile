
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Customer } from "@/types/customer";
import { Supplier } from "@/types/supplier";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import PartnerSelector from "./PartnerSelector";
import PartnerDetails from "./PartnerDetails";

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
  
  const getDisplayName = () => {
    if (type === "customer" && selectedCustomer) {
      return selectedCustomer.name;
    }
    if (type === "supplier" && selectedSupplier) {
      return selectedSupplier.name;
    }
    return type === "customer" ? "Müşteri seçin..." : "Tedarikçi seçin...";
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
            <TabsContent value="customer">
              <PartnerSelector 
                type="customer"
                partners={customers}
                onSelectPartner={onSelectCustomer}
                onClose={() => onOpenChange(false)}
              />
            </TabsContent>
            <TabsContent value="supplier">
              <PartnerSelector 
                type="supplier"
                partners={suppliers}
                onSelectPartner={onSelectSupplier}
                onClose={() => onOpenChange(false)}
              />
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      
      {type === "customer" ? (
        <PartnerDetails type="customer" partner={selectedCustomer} />
      ) : (
        <PartnerDetails type="supplier" partner={selectedSupplier} />
      )}
    </div>
  );
};

export default CustomerSelect;
