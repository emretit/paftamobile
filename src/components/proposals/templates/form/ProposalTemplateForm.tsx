
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ProposalTemplate } from "@/types/proposal-template";
import { ProposalFormData, ProposalItem } from "@/types/proposal-form";
import { Button } from "@/components/ui/button";
import ProposalTemplateFormHeader from "./ProposalTemplateFormHeader";
import ProposalTemplateFormDetails from "./ProposalTemplateFormDetails";
import ProposalTemplateCustomerSelect from "./ProposalTemplateCustomerSelect";
import ProposalTemplatePaymentTerms from "./ProposalTemplatePaymentTerms";
import ProposalTemplateItems from "./ProposalTemplateItems";
import ProposalTemplateNotes from "./ProposalTemplateNotes";

interface ProposalTemplateFormProps {
  template: ProposalTemplate;
  onSaveDraft: () => void;
}

const ProposalTemplateForm: React.FC<ProposalTemplateFormProps> = ({ template, onSaveDraft }) => {
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [validUntil, setValidUntil] = useState<Date | undefined>(
    template.prefilledFields?.validityDays 
      ? new Date(Date.now() + template.prefilledFields.validityDays * 24 * 60 * 60 * 1000) 
      : undefined
  );

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProposalFormData>({
    defaultValues: {
      title: template.prefilledFields?.title || "",
      customer_id: null,
      items: [],
      discounts: 0,
      additionalCharges: 0,
      paymentTerm: (template.prefilledFields?.paymentTerm as any) || "prepaid",
      internalNotes: template.prefilledFields?.internalNotes || "",
      status: "draft",
    },
  });

  useEffect(() => {
    // Initialize items from template
    if (template.items.length > 0) {
      const initialItems = template.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
      }));
      setItems(initialItems);
    }
  }, [template]);

  const onSubmit = (data: ProposalFormData) => {
    const formData = {
      ...data,
      items,
      validUntil,
    };
    console.log("Form data to be submitted:", formData);
    onSaveDraft();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ProposalTemplateFormHeader />
      
      <ProposalTemplateFormDetails 
        register={register}
        errors={errors}
        validUntil={validUntil}
        setValidUntil={setValidUntil}
      />
      
      <ProposalTemplateCustomerSelect 
        register={register}
      />
      
      <ProposalTemplatePaymentTerms 
        defaultValue={template.prefilledFields?.paymentTerm || "prepaid"}
        setValue={setValue}
      />
      
      <ProposalTemplateItems 
        items={items}
        setItems={setItems}
      />
      
      <ProposalTemplateNotes 
        register={register}
      />

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="submit" className="w-full md:w-auto">
          Taslak Olarak Kaydet
        </Button>
      </div>
    </form>
  );
};

export default ProposalTemplateForm;
