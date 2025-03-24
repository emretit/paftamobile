
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Proposal } from "@/types/proposal";

export interface ProposalFormHeaderProps {
  title: string;
  subtitle: string;
  loading: boolean;
  saving: boolean;
  isNew: boolean;
  proposal: Proposal | null;
}

const ProposalFormHeader: React.FC<ProposalFormHeaderProps> = ({
  title,
  subtitle,
  loading,
  saving,
  isNew,
  proposal
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {saving && (
          <div className="text-sm text-muted-foreground animate-pulse">
            Kaydediliyor...
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalFormHeader;
