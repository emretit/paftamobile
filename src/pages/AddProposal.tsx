
import { useState } from "react";
import { ProposalForm } from "@/components/proposals/form/ProposalForm";
import { DefaultLayout } from "@/components/layouts/DefaultLayout";

interface AddProposalProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const AddProposal = ({ isCollapsed, setIsCollapsed }: AddProposalProps) => {
  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Add New Proposal"
    >
      <div className="container py-6">
        <ProposalForm />
      </div>
    </DefaultLayout>
  );
};

export default AddProposal;
