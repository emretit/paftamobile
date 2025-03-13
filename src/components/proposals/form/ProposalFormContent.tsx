
import React from "react";
import { FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";
import { ProposalItem } from "@/types/proposal-form";
import ProposalHeader from "./ProposalHeader";
import ProposalPartnerSelect from "./ProposalPartnerSelect";
import ProposalEmployeeSelect from "./ProposalEmployeeSelect";
import ProposalDetailsSection from "./ProposalDetailsSection";
import ProposalItemsSection from "./ProposalItemsSection";
import ProposalAttachments from "./ProposalAttachments";
import ProposalSummary from "./ProposalSummary";

interface ProposalFormContentProps {
  methods: any;
  partnerType: "customer" | "supplier";
  setPartnerType: (type: "customer" | "supplier") => void;
  items: ProposalItem[];
  setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  totalValues: {
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    discounts: number;
    additionalCharges: number;
  };
  onSaveDraft: (data: any) => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const ProposalFormContent = ({
  methods,
  partnerType,
  setPartnerType,
  items,
  setItems,
  files,
  setFiles,
  totalValues,
  onSaveDraft,
  onSubmit,
  isLoading,
}: ProposalFormContentProps) => {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <ProposalHeader
              partnerType={partnerType}
              setPartnerType={setPartnerType}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              <div className="space-y-6">
                <ProposalPartnerSelect partnerType={partnerType} />
                <ProposalEmployeeSelect />
                <ProposalDetailsSection />
              </div>

              <div className="space-y-6">
                <ProposalAttachments files={files} setFiles={setFiles} />
                <ProposalSummary totalValues={totalValues} />
              </div>
            </div>

            <ProposalItemsSection items={items} setItems={setItems} />

            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={methods.handleSubmit(onSaveDraft)}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Taslak Olarak Kaydet
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                Teklifi Gönder
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};

export default ProposalFormContent;
