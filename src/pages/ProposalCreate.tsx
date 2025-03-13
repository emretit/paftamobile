
import { useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProposalFormData, ProposalItem } from "@/types/proposal-form";
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
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const ProposalCreate = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [partnerType, setPartnerType] = useState<"customer" | "supplier">("customer");
  const { createProposal, saveDraft } = useProposalForm();
  const { customers, suppliers } = useCustomerSelect();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
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

  // Calculate form completion progress
  const calculateProgress = () => {
    let totalFields = 5; // Required fields: title, customer_id, at least one item, paymentTerm, status
    let completedFields = 0;
    
    if (watch("title")) completedFields++;
    if (watch("customer_id") || watch("supplier_id")) completedFields++;
    if (items.length > 0) completedFields++;
    if (watch("paymentTerm")) completedFields++;
    if (watch("status")) completedFields++;
    
    const progress = Math.floor((completedFields / totalFields) * 100);
    setFormProgress(progress);
    return progress;
  };

  // Update progress when form changes
  React.useEffect(() => {
    calculateProgress();
  }, [watch("title"), watch("customer_id"), items, watch("paymentTerm"), watch("status")]);

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
    if (items.length === 0) {
      toast.error("En az bir teklif kalemi eklemelisiniz");
      return;
    }

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

  const selectedCustomer = customers?.find(
    customer => customer.id === watch("customer_id")
  );

  const selectedSupplier = suppliers?.find(
    supplier => supplier.id === watch("supplier_id")
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

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1 mr-4">
                  <div className="text-sm font-medium mb-1">Form Tamamlama</div>
                  <Progress 
                    value={formProgress} 
                    className="h-2" 
                    indicatorClassName={formProgress < 50 ? "bg-red-500" : formProgress < 100 ? "bg-yellow-500" : "bg-green-500"}
                  />
                </div>
                <div className="text-lg font-semibold">%{formProgress}</div>
              </div>
            </CardContent>
          </Card>

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
              className="p-6 border rounded-lg bg-white shadow-sm"
            />

            <CustomerSelect
              isOpen={isCustomerOpen}
              onOpenChange={setIsCustomerOpen}
              selectedCustomer={selectedCustomer}
              selectedSupplier={selectedSupplier}
              customers={customers}
              suppliers={suppliers}
              onSelectCustomer={(id) => {
                setValue("customer_id", id);
                setValue("supplier_id", null);
              }}
              onSelectSupplier={(id) => {
                setValue("supplier_id", id);
                setValue("customer_id", null);
              }}
              type={partnerType}
              onTypeChange={setPartnerType}
            />

            <Card>
              <CardContent className="p-6">
                <PaymentTermsSelect
                  value={watch("paymentTerm")}
                  onChange={(value) => setValue("paymentTerm", value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <InternalNotes
                  value={watch("internalNotes")}
                  onChange={(e) => setValue("internalNotes", e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <ProposalItems
                  items={items}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onUpdateItem={updateItem}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <AdditionalCharges
                  discounts={watch("discounts")}
                  onDiscountsChange={(e) => setValue("discounts", Number(e.target.value))}
                  additionalCharges={watch("additionalCharges")}
                  onAdditionalChargesChange={(e) => setValue("additionalCharges", Number(e.target.value))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <FileUpload
                  files={files}
                  onFileChange={handleFileChange}
                  onRemoveFile={removeFile}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => navigate("/proposals")}
              >
                İptal
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-100"
                onClick={handleSaveDraft}
                disabled={createProposal.isPending || saveDraft.isPending}
              >
                Taslak Olarak Kaydet
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
                onClick={handleSubmit(onSubmit)}
                disabled={createProposal.isPending || saveDraft.isPending}
              >
                Teklif Oluştur
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProposalCreate;
