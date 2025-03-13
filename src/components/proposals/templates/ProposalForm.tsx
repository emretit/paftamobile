
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProposalTemplate } from "@/types/proposal-template";
import { ProposalFormData, ProposalItem, PaymentTerm } from "@/types/proposal-form";
import ProposalItems from "@/components/proposals/form/ProposalItems";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface ProposalFormProps {
  template: ProposalTemplate;
  onSaveDraft: () => void;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ template, onSaveDraft }) => {
  const [items, setItems] = useState<ProposalItem[]>([]);
  const { customers } = useCustomerSelect();
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
      paymentTerm: (template.prefilledFields?.paymentTerm as PaymentTerm) || "prepaid",
      internalNotes: template.prefilledFields?.internalNotes || "",
      status: "draft",
    },
  });

  useEffect(() => {
    // Initialize items from template
    if (template.items.length > 0) {
      const initialItems = template.items.map(item => ({
        ...item,
        id: uuidv4(),
      }));
      setItems(initialItems);
    }
  }, [template]);

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
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Teklif Detayları</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="title">Teklif Başlığı</Label>
            <Input 
              id="title" 
              {...register("title", { required: "Teklif başlığı gereklidir" })} 
              placeholder="Teklif başlığını girin"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>
          
          <div>
            <Label htmlFor="customer_id">Müşteri</Label>
            <Select onValueChange={(value) => setValue("customer_id", value)}>
              <SelectTrigger id="customer_id">
                <SelectValue placeholder="Müşteri seçin" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} {customer.company ? `(${customer.company})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment_term">Ödeme Koşulları</Label>
            <Select 
              onValueChange={(value: PaymentTerm) => setValue("paymentTerm", value)}
              defaultValue={template.prefilledFields?.paymentTerm || "prepaid"}
            >
              <SelectTrigger id="payment_term">
                <SelectValue placeholder="Ödeme koşulu seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prepaid">Peşin</SelectItem>
                <SelectItem value="net30">30 Gün</SelectItem>
                <SelectItem value="net60">60 Gün</SelectItem>
                <SelectItem value="custom">Özel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="valid_until">Geçerlilik Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal"
                >
                  {validUntil ? (
                    format(validUntil, "PPP", { locale: tr })
                  ) : (
                    <span className="text-gray-500">Tarih seçin</span>
                  )}
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={validUntil}
                  onSelect={(date) => setValidUntil(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ProposalItems
          items={items}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onUpdateItem={updateItem}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Ek Bilgiler</h2>
        <div>
          <Label htmlFor="internal_notes">İç Notlar</Label>
          <Textarea 
            id="internal_notes" 
            {...register("internalNotes")} 
            placeholder="Şirket içi notlar"
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="submit" className="w-full md:w-auto">
          Taslak Olarak Kaydet
        </Button>
      </div>
    </form>
  );
};

export default ProposalForm;
