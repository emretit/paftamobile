
import { useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { ProposalFormData, ProposalItem, ProposalFormProps } from "@/types/proposal-form";
import Navbar from "@/components/Navbar";
import { useProposalForm } from "@/hooks/useProposalForm";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import ProposalFormHeader from "@/components/proposals/form/ProposalFormHeader";
import CustomerSelect from "@/components/proposals/form/CustomerSelect";
import ProposalItems from "@/components/proposals/form/ProposalItems";
import FileUpload from "@/components/proposals/form/FileUpload";
import ProposalDetails from "@/components/proposals/form/ProposalDetails";
import PaymentTermsSelect from "@/components/proposals/form/PaymentTermsSelect";
import InternalNotes from "@/components/proposals/form/InternalNotes";
import AdditionalCharges from "@/components/proposals/form/AdditionalCharges";

const ProposalForm = ({ isCollapsed, setIsCollapsed }: ProposalFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const { createProposal, saveDraft } = useProposalForm();
  const { data: customerOptions } = useCustomerSelect();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<ProposalFormData>({
    defaultValues: {
      title: "",
      customer_id: null,
      items: [],
      discounts: 0,
      additionalCharges: 0,
      validUntil: null,
      paymentTerm: "prepaid",
      internalNotes: "",
      status: "draft",
      files: [],
    },
  });

  const addItem = () => {
    const newItem: ProposalItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: number | string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice" || field === "taxRate") {
          const quantity = field === "quantity" ? Number(value) : item.quantity;
          const unitPrice = field === "unitPrice" ? Number(value) : item.unitPrice;
          const taxRate = field === "taxRate" ? Number(value) : item.taxRate;
          updatedItem.totalPrice = quantity * unitPrice * (1 + taxRate / 100);
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProposalFormData) => {
    const formData: ProposalFormData = {
      ...data,
      items,
      files,
      status: "new" as const,
    };
    createProposal.mutate(formData);
  };

  const handleSaveDraft = async () => {
    const formData: ProposalFormData = {
      ...watch(),
      items,
      files,
      status: "draft" as const,
    };
    saveDraft.mutate(formData);
  };

  const selectedCustomer = customerOptions?.find(
    customer => customer.id === watch("customer_id")
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6">
          <ProposalFormHeader
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={createProposal.isPending || saveDraft.isPending}
          />

          <form className="space-y-6 max-w-4xl">
            <ProposalDetails
              title={watch("title")}
              onTitleChange={(value) => setValue("title", value)}
              proposalDate={new Date()}
              onProposalDateChange={() => {}}
              expirationDate={watch("validUntil")}
              onExpirationDateChange={(date) => setValue("validUntil", date)}
              status={watch("status")}
              onStatusChange={(value) => setValue("status", value as ProposalFormData["status"])}
            />

            <CustomerSelect
              isOpen={isCustomerOpen}
              onOpenChange={setIsCustomerOpen}
              selectedCustomer={selectedCustomer}
              customers={customerOptions}
              onSelect={(id) => setValue("customer_id", id)}
            />

            <PaymentTermsSelect
              value={watch("paymentTerm")}
              onChange={(value) => setValue("paymentTerm", value)}
            />

            <InternalNotes
              value={watch("internalNotes")}
              onChange={(e) => setValue("internalNotes", e.target.value)}
            />

            <ProposalItems
              items={items}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
            />

            <AdditionalCharges
              discounts={watch("discounts")}
              onDiscountsChange={(e) => setValue("discounts", Number(e.target.value))}
              additionalCharges={watch("additionalCharges")}
              onAdditionalChargesChange={(e) => setValue("additionalCharges", Number(e.target.value))}
            />

            <FileUpload
              files={files}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProposalForm;
