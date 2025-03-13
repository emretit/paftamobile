
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText, Truck } from "lucide-react";

interface ProposalHeaderProps {
  partnerType: "customer" | "supplier";
  setPartnerType: (type: "customer" | "supplier") => void;
}

const ProposalHeader = ({ partnerType, setPartnerType }: ProposalHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
      <div className="flex items-center gap-2">
        {partnerType === "customer" ? (
          <FileText className="h-6 w-6 text-primary" />
        ) : (
          <Truck className="h-6 w-6 text-primary" />
        )}
        <h2 className="text-xl font-semibold">
          {partnerType === "customer" ? "Müşteri Teklifi" : "Tedarikçi Teklifi"}
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="partner-toggle" className={partnerType === "customer" ? "font-medium" : "text-gray-500"}>
            Müşteri
          </Label>
          <Switch
            id="partner-toggle"
            checked={partnerType === "supplier"}
            onCheckedChange={(checked) => setPartnerType(checked ? "supplier" : "customer")}
          />
          <Label htmlFor="partner-toggle" className={partnerType === "supplier" ? "font-medium" : "text-gray-500"}>
            Tedarikçi
          </Label>
        </div>
      </div>
    </div>
  );
};

export default ProposalHeader;
