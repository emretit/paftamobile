
import React from "react";
import { Building2 } from "lucide-react";

interface CustomerInfoProps {
  customerId?: string;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ customerId }) => {
  if (!customerId) return null;
  
  return (
    <div className="bg-muted/40 p-4 rounded-lg">
      <div className="flex items-center">
        <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Müşteri</h3>
      </div>
      <p className="text-muted-foreground mt-1">Müşteri ID: {customerId}</p>
    </div>
  );
};
