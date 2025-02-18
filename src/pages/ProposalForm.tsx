import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Save, FileText, Upload } from "lucide-react";
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
import { ProposalFormData, ProposalItem, PaymentTerm } from "@/types/proposal-form";
import Navbar from "@/components/Navbar";
import { useProposalForm } from "@/hooks/useProposalForm";

const paymentTerms: { value: PaymentTerm; label: string }[] = [
  { value: "prepaid", label: "Peşin Ödeme" },
  { value: "net30", label: "30 Gün Vade" },
  { value: "net60", label: "60 Gün Vade" },
  { value: "custom", label: "Özel Vade" },
];

const ProposalForm = ({ isCollapsed, setIsCollapsed }: ProposalFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ProposalItem[]>([]);
  const { customers, createProposal, saveDraft } = useProposalForm();

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
    const formData = {
      ...data,
      items,
      files,
      status: "new",
    };
    createProposal.mutate(formData);
  };

  const handleSaveDraft = async () => {
    const formData = {
      ...watch(),
      items,
      files,
      status: "draft",
    };
    saveDraft.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${
        isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yeni Teklif</h1>
              <p className="text-gray-600 mt-1">Yeni bir teklif oluştur</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={createProposal.isPending || saveDraft.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Taslak Kaydet
              </Button>
              <Button 
                onClick={handleSubmit(onSubmit)}
                disabled={createProposal.isPending || saveDraft.isPending}
              >
                <FileText className="w-4 h-4 mr-2" />
                Teklif Oluştur
              </Button>
            </div>
          </div>

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

                <div>
                  <Label htmlFor="customer">Müşteri</Label>
                  <Select onValueChange={(value) => setValue("customer_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Teklif Kalemleri</h3>
                <Button onClick={addItem} type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Kalem Ekle
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-6 gap-4 items-start p-4 border rounded-lg">
                    <div className="col-span-2">
                      <Label>Ürün/Hizmet Adı</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        placeholder="Ürün/hizmet adı"
                      />
                    </div>
                    <div>
                      <Label>Miktar</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Birim Fiyat</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label>KDV Oranı (%)</Label>
                      <Input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => updateItem(item.id, "taxRate", e.target.value)}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

            <div className="space-y-4">
              <Label>Dosya Ekleri</Label>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Dosya Yükle
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProposalForm;
