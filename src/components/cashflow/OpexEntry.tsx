import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Plus, Save, Trash2, Upload, X, Download } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useCashflowTransactions } from "@/hooks/useCashflowTransactions";
import { useCashflowCategories } from "@/hooks/useCashflowCategories";
import { useCashflowAnalytics } from "@/hooks/useCashflowAnalytics";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useBulkTransactions } from "@/hooks/useBulkTransactions";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// OPEX categories for 10+ employee companies in Turkey
const DEFAULT_OPEX_CATEGORIES = [
  "Kira",
  "Elektrik",
  "Su",
  "Doğalgaz",
  "İnternet",
  "Ofis Malzemeleri",
  "Maaş & Ücretler",
  "Sigorta",
  "Araç/Yakıt",
  "Bakım/Temizlik",
  "Pazarlama",
  "Danışmanlık",
  "Vergiler",
  "Banka Masrafları",
  "Diğer"
];

const opexItemSchema = z.object({
  categoryId: z.string().min(1, "Kategori seçilmelidir"),
  amount: z.number().min(0.01, "Tutar 0'dan büyük olmalıdır"),
  date: z.date(),
  description: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

const opexFormSchema = z.object({
  items: z.array(opexItemSchema),
});

type OpexFormData = z.infer<typeof opexFormSchema>;

interface OpexItem {
  id: string;
  categoryId: string;
  amount: number;
  date: Date;
  description?: string;
  attachmentUrl?: string;
  file?: File;
}

const OpexEntry = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL_CATEGORIES');
  
  const { transactions } = useCashflowTransactions();
  const { categories } = useCashflowCategories();
  const { formatCurrency } = useCashflowAnalytics(transactions);
  const { uploadFile, uploading } = useFileUpload();
  const { createBulkTransactions, loading } = useBulkTransactions();
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OpexFormData>({
    resolver: zodResolver(opexFormSchema),
    defaultValues: {
      items: [
        {
          categoryId: '',
          amount: 0,
          date: new Date(),
          description: '',
          attachmentUrl: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const opexCategories = expenseCategories.filter(cat => 
    DEFAULT_OPEX_CATEGORIES.some(opex => 
      cat.name.toLowerCase().includes(opex.toLowerCase()) || 
      opex.toLowerCase().includes(cat.name.toLowerCase())
    )
  );

  const addNewRow = () => {
    append({
      categoryId: '',
      amount: 0,
      date: new Date(),
      description: '',
      attachmentUrl: '',
    });
  };

  const onSubmit = async (data: OpexFormData) => {
    try {
      const validItems = data.items.filter(item => item.categoryId && item.amount > 0);
      
      if (validItems.length === 0) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "En az bir geçerli OPEX kalemi girmeniz gerekiyor.",
        });
        return;
      }

      const transactionData = validItems.map(item => ({
        type: 'expense' as const,
        category_id: item.categoryId,
        amount: item.amount,
        date: format(item.date, 'yyyy-MM-dd'),
        description: item.description || '',
        attachment_url: item.attachmentUrl || '',
      }));

      await createBulkTransactions(transactionData);

      reset({
        items: [
          {
            categoryId: '',
            amount: 0,
            date: new Date(),
            description: '',
            attachmentUrl: '',
          },
        ],
      });
    } catch (error) {
      console.error('Error saving OPEX items:', error);
    }
  };

  const filteredOpexTransactions = transactions.filter(transaction => {
    const isOpex = transaction.type === 'expense' && 
      transaction.category && 
      DEFAULT_OPEX_CATEGORIES.some(opex => 
        transaction.category!.name.toLowerCase().includes(opex.toLowerCase()) || 
        opex.toLowerCase().includes(transaction.category!.name.toLowerCase())
      );

    if (!isOpex) return false;

    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!dateFrom || transactionDate >= dateFrom) && 
                           (!dateTo || transactionDate <= dateTo);
    const matchesCategory = !selectedCategory || selectedCategory === 'ALL_CATEGORIES' || transaction.category_id === selectedCategory;

    return matchesDateRange && matchesCategory;
  });

  const exportToExcel = () => {
    const csvContent = [
      ['Tarih', 'Kategori', 'Tutar', 'Açıklama', 'Ek Dosya'],
      ...filteredOpexTransactions.map(transaction => [
        format(new Date(transaction.date), 'dd/MM/yyyy'),
        transaction.category?.name || '',
        transaction.amount.toString(),
        transaction.description || '',
        transaction.attachment_url ? 'Var' : 'Yok'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `opex_raporu_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('entry')}
          className={cn(
            "px-4 py-2 font-medium transition-colors",
            activeTab === 'entry' 
              ? "text-primary border-b-2 border-primary" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          OPEX Girişi
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-4 py-2 font-medium transition-colors",
            activeTab === 'history' 
              ? "text-primary border-b-2 border-primary" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          OPEX Geçmişi
        </button>
      </div>

      {activeTab === 'entry' && (
        <Card>
          <CardHeader>
            <CardTitle>OPEX Toplu Giriş</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Ek Dosya</TableHead>
                      <TableHead>İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Select
                            value={field.categoryId}
                            onValueChange={(value) => {
                              const newItems = [...fields];
                              newItems[index] = { ...newItems[index], categoryId: value };
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {opexCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register(`items.${index}.amount`, { valueAsNumber: true })}
                          />
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.date ? format(field.date, "PPP", { locale: tr }) : "Tarih seçin"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.date}
                                onSelect={(date) => {
                                  if (date) {
                                    const newItems = [...fields];
                                    newItems[index] = { ...newItems[index], date };
                                  }
                                }}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Açıklama (isteğe bağlı)"
                            {...register(`items.${index}.description`)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const attachmentUrl = await uploadFile(file, 'opex-receipts');
                                if (attachmentUrl) {
                                  const newItems = [...fields];
                                  newItems[index] = { ...newItems[index], attachmentUrl };
                                }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={addNewRow}>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Satır Ekle
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  Tümünü Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>OPEX Geçmişi</span>
              <Button onClick={exportToExcel} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Excel'e Aktar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <Label>Başlangıç Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label>Bitiş Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label>Kategori</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm kategoriler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_CATEGORIES">Tüm kategoriler</SelectItem>
                    {opexCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Ek Dosya</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpexTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{transaction.category?.name}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>
                        {transaction.attachment_url && (
                          <a 
                            href={transaction.attachment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Görüntüle
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredOpexTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Seçilen kriterlere uygun OPEX kaydı bulunamadı.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OpexEntry;