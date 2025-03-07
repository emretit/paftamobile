
import React from "react";
import { Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

interface CustomerInfoProps {
  customerId?: string;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ customerId }) => {
  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async (): Promise<Customer | null> => {
      if (!customerId) return null;
      
      console.log("Fetching customer data for ID:", customerId);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();
      
      if (error) {
        console.error("Error fetching customer:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!customerId,
  });

  if (!customerId) return null;
  
  return (
    <div className="bg-muted/40 p-4 rounded-lg">
      <div className="flex items-center">
        <Building2 className="h-5 w-5 mr-2 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Müşteri</h3>
      </div>
      
      {isLoading ? (
        <p className="text-muted-foreground mt-1">Müşteri bilgileri yükleniyor...</p>
      ) : customer ? (
        <div className="mt-2 space-y-1">
          <p className="font-medium">{customer.name} {customer.company ? `(${customer.company})` : ''}</p>
          <p className="text-muted-foreground text-sm">{customer.email}</p>
          {customer.mobile_phone && (
            <p className="text-muted-foreground text-sm">Tel: {customer.mobile_phone}</p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground mt-1">Müşteri ID: {customerId}</p>
      )}
    </div>
  );
};
