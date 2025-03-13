
import React from "react";
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
    </div>
  );
};

export default ProposalHeader;
