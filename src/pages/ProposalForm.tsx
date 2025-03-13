
import React from "react";
import Navbar from "@/components/Navbar";
import { ProposalFormProps } from "@/types/proposal-form";
import { useProposalFormState } from "@/hooks/useProposalFormState";
import ProposalFormActions from "@/components/proposals/form/ProposalFormActions";
import ProposalFormContent from "@/components/proposals/form/ProposalFormContent";

const ProposalFormPage = ({ isCollapsed, setIsCollapsed }: ProposalFormProps) => {
  const {
    methods,
    isLoading,
    partnerType,
    setPartnerType,
    items,
    setItems,
    files,
    setFiles,
    totalValues,
    handleBack,
    handleSaveDraft,
    handleSubmit,
    id
  } = useProposalFormState();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-4 md:p-6">
          <ProposalFormActions
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
          
          <ProposalFormContent
            methods={methods}
            partnerType={partnerType}
            setPartnerType={setPartnerType}
            items={items}
            setItems={setItems}
            files={files}
            setFiles={setFiles}
            totalValues={totalValues}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default ProposalFormPage;
