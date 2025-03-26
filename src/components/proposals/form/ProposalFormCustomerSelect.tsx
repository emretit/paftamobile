
import React from "react";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProposalCustomerSelectProps {
  selectedCustomerId?: string;
  onSelectCustomer: (customerId: string) => void;
  error?: string;
}

const ProposalFormCustomerSelect: React.FC<ProposalCustomerSelectProps> = ({
  selectedCustomerId,
  onSelectCustomer,
  error
}) => {
  const { customers, isLoading } = useCustomerSelect();

  return (
    <div className="space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-lg">Müşteri Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2">
          <Label htmlFor="customer" className={error ? "text-red-500" : ""}>
            Müşteri <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={selectedCustomerId} 
            onValueChange={onSelectCustomer}
            disabled={isLoading}
          >
            <SelectTrigger id="customer" className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="Müşteri seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.company ? `${customer.name} (${customer.company})` : customer.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </CardContent>
    </div>
  );
};

export default ProposalFormCustomerSelect;
