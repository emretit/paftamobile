
import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "./PaymentDialog";
import { PaymentsList } from "./PaymentsList";
import { Customer } from "@/types/customer";

interface PaymentsTabProps {
  customer: Customer;
}

export const PaymentsTab = ({ customer }: PaymentsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Cari Hareketler</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ödeme Ekle
        </Button>
      </div>

      <PaymentsList customer={customer} />
      
      <PaymentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        customer={customer}
      />
    </Card>
  );
};
