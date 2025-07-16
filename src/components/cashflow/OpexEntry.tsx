import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useCashflowTransactions } from "@/hooks/useCashflowTransactions";
import { useCashflowCategories } from "@/hooks/useCashflowCategories";
import { useCashflowAnalytics } from "@/hooks/useCashflowAnalytics";
import { cn } from "@/lib/utils";
import OpexMatrix from "./OpexMatrix";

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

const OpexEntry = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL_CATEGORIES');
  
  const { transactions } = useCashflowTransactions();
  const { categories } = useCashflowCategories();
  const { formatCurrency } = useCashflowAnalytics(transactions);

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const opexCategories = expenseCategories.filter(cat => 
    DEFAULT_OPEX_CATEGORIES.some(opex => 
      cat.name.toLowerCase().includes(opex.toLowerCase()) || 
      opex.toLowerCase().includes(cat.name.toLowerCase())
    )
  );

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
          OPEX Matrix
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
        <OpexMatrix />
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