
import React from "react";
import { Proposal } from "@/types/proposal";
import { ProposalFormData } from "@/types/proposal-form";
import ProposalFormBasicInfo from "./ProposalFormBasicInfo";
import ProposalFormCustomerInfo from "./ProposalFormCustomerInfo";
import ProposalFormDetails from "./ProposalFormDetails";
import ProposalItems from "./items/ProposalItems";

interface ProposalFormContentProps {
  formData: ProposalFormData;
  formErrors: Record<string, string>;
  isNew: boolean;
  proposal: Proposal | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleItemsChange: (items: any[]) => void;
  formatDate: (dateString?: string | null) => string;
}

const ProposalFormContent: React.FC<ProposalFormContentProps> = ({
  formData,
  formErrors,
  isNew,
  proposal,
  handleInputChange,
  handleSelectChange,
  handleDateChange,
  handleItemsChange,
  formatDate
}) => {
  return (
    <div className="space-y-8 my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProposalFormBasicInfo
          formData={{
            title: formData.title,
            status: formData.status,
            valid_until: formData.valid_until || ""
          }}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleDateChange={handleDateChange}
          formatDate={formatDate}
        />
        
        <ProposalFormCustomerInfo
          proposal={proposal}
          isNew={isNew}
        />
      </div>
      
      <ProposalItems
        items={formData.items || []}
        onItemsChange={handleItemsChange}
        globalCurrency={formData.currency || "TRY"} // Global para birimini ilet
      />
      
      <ProposalFormDetails
        formData={{
          description: formData.description || "",
          payment_terms: formData.payment_terms || "",
          delivery_terms: formData.delivery_terms || "",
          notes: formData.notes || ""
        }}
        handleInputChange={handleInputChange}
      />
    </div>
  );
};

export default ProposalFormContent;
