
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProposalFormData, ProposalItem, PaymentTerm, ProposalFormProps } from "@/types/proposal-form";
import Navbar from "@/components/Navbar";
import { useProposalForm } from "@/hooks/useProposalForm";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import ProposalFormHeader from "@/components/proposals/form/ProposalFormHeader";
import CustomerSelect from "@/components/proposals/form/CustomerSelect";
import ProposalItems from "@/components/proposals/form/ProposalItems";
import FileUpload from "@/components/proposals/form/FileUpload";

const paymentTerms: { value: PaymentTerm; label: string }[] = [
  { value: "prepaid", label: "Peşin Ödeme" },
  { value: "net30", label: "30 Gün Vade" },
  { value: "net60", label: "60 Gün Vade" },
  { value: "custom", label: "Özel Vade" },
];

const ProposalForm = ({ isCollapsed, setIsCollapsed }: ProposalFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const { customers, createProposal, saveDraft } = useProposalForm();
  const { data: customerOptions, isLoading: isLoadingCustomers } = useCustomerSelect();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Teklif Başlığı</Label>
                  <Input
                    id="title"
                    {...register("title", { required: true })}
                    placeholder="Teklif başlığı girin"
                    className="mt-1"
                  />
                  {errors.title && (
                    <span className="text-sm text-red-500">Bu alan zorunludur</span>
                  )}
                </div>

                <CustomerSelect
                  isOpen={isCustomerOpen}
                  onOpenChange={setIsCustomerOpen}
                  selectedCustomer={selectedCustomer}
                  customers={customerOptions}
                  onSelect={(id) => setValue("customer_id", id)}
                />

                <div>
                  <Label htmlFor="validUntil">Geçerlilik Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {watch("validUntil") ? (
                          format(watch("validUntil"), "PPP")
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch("validUntil")}
                        onSelect={(date) => setValue("validUntil", date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="paymentTerm">Ödeme Koşulları</Label>
                  <Select
                    value={watch("paymentTerm")}
                    onValueChange={(value) => setValue("paymentTerm", value as PaymentTerm)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ödeme koşulu seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTerms.map((term) => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="internalNotes">İç Notlar</Label>
                <Textarea
                  id="internalNotes"
                  {...register("internalNotes")}
                  placeholder="Satış ekibine özel notlar..."
                  className="mt-1 h-[calc(100%-1.5rem)]"
                />
              </div>
            </div>

            <ProposalItems
              items={items}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="discounts">İndirimler</Label>
                <Input
                  id="discounts"
                  type="number"
                  {...register("discounts")}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="additionalCharges">Ek Ücretler</Label>
                <Input
                  id="additionalCharges"
                  type="number"
                  {...register("additionalCharges")}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

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
