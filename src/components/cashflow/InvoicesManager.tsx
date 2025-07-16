import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Plus, FileUp, FileDown, Search, Filter, Calendar, ExternalLink, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import InvoiceAnalysisTable from "./InvoiceAnalysisTable";

const InvoicesManager = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateOpen, setDateOpen] = useState(false);
  
  // For now, we'll use placeholder data for sales invoices
  const salesInvoices = null;
  const salesLoading = false;
  const [salesFilters, setSalesFilters] = useState({
    status: "",
    search: "",
    dateRange: { from: null as Date | null, to: null as Date | null }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'odendi':
        return <Badge className="bg-green-500">Ödendi</Badge>;
      case 'kismi_odendi':
        return <Badge className="bg-blue-500">Kısmi Ödeme</Badge>;
      case 'odenmedi':
        return <Badge className="bg-amber-500">Ödenmedi</Badge>;
      case 'gecikti':
        return <Badge className="bg-red-500">Gecikti</Badge>;
      case 'iptal':
        return <Badge className="bg-gray-500">İptal</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'e_fatura':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">e-Fatura</Badge>;
      case 'e_arsiv':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">e-Arşiv</Badge>;
      case 'fatura':
        return <Badge variant="outline" className="border-gray-500 text-gray-700">Fatura</Badge>;
      case 'irsaliye':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">İrsaliye</Badge>;
      case 'makbuz':
        return <Badge variant="outline" className="border-green-500 text-green-700">Makbuz</Badge>;
      case 'serbest_meslek_makbuzu':
        return <Badge variant="outline" className="border-indigo-500 text-indigo-700">SMM</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Sales Invoice Analytics (placeholder data)
  const totalSalesInvoices = 42;
  const totalSalesPaid = 28;
  const totalSalesUnpaid = 12;
  const totalSalesOverdue = 2;
  
  const totalSalesAmountSum = 285000;
  const paidSalesAmountSum = 195000;
  const unpaidSalesAmountSum = 90000;

  const renderSalesInvoices = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <CardContent className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Toplam Fatura</span>
              <FileUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalSalesInvoices}</p>
            <span className="text-sm text-gray-500">Bu dönem</span>
          </CardContent>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <CardContent className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ödenen</span>
              <FileUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paidSalesAmountSum)}</p>
            <span className="text-sm text-gray-500">{totalSalesPaid} fatura</span>
          </CardContent>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <CardContent className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Bekleyen</span>
              <FileUp className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(unpaidSalesAmountSum)}</p>
            <span className="text-sm text-gray-500">{totalSalesUnpaid} fatura</span>
          </CardContent>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <CardContent className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Vadesi Geçmiş</span>
              <FileUp className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{totalSalesOverdue}</p>
            <span className="text-sm text-gray-500">fatura</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end justify-between mb-4">
            <div className="flex flex-1 flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Fatura ara..."
                  className="pl-9"
                  value={salesFilters.search}
                  onChange={(e) => setSalesFilters({ ...salesFilters, search: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2">
                <Select
                  value={salesFilters.status}
                  onValueChange={(value) => setSalesFilters({ ...salesFilters, status: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ödeme Durumu" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="">Tümü</SelectItem>
                    <SelectItem value="odendi">Ödendi</SelectItem>
                    <SelectItem value="kismi_odendi">Kısmi Ödendi</SelectItem>
                    <SelectItem value="odenmedi">Ödenmedi</SelectItem>
                    <SelectItem value="gecikti">Gecikti</SelectItem>
                    <SelectItem value="iptal">İptal</SelectItem>
                  </SelectContent>
                </Select>
                
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start text-left font-normal flex gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Tarih Aralığı</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                    <DatePickerWithRange
                      value={{
                        from: salesFilters.dateRange.from,
                        to: salesFilters.dateRange.to,
                      }}
                      onChange={(range) => {
                        setSalesFilters({
                          ...salesFilters,
                          dateRange: {
                            from: range.from,
                            to: range.to,
                          }
                        });
                        setDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <Button variant="secondary" onClick={() => setSalesFilters({
              status: "",
              search: "",
              dateRange: { from: null, to: null }
            })}>
              <Filter className="h-4 w-4 mr-2" />
              Filtreleri Temizle
            </Button>
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-7 gap-2 p-4 font-medium text-sm text-gray-500 bg-gray-50 rounded-t-md">
              <div>Fatura No</div>
              <div className="col-span-2">Müşteri</div>
              <div>Tarih</div>
              <div>Tutar</div>
              <div>Durum</div>
              <div>Tip</div>
            </div>
            
            <Separator />
            
            <div className="p-8 text-center text-gray-500">
              Henüz satış faturası bulunmuyor. Satış faturası özelliği yakında eklenecektir.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPurchaseInvoices = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-sm">
          <CardContent className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Toplam Fatura</span>
              <FileDown className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">84</p>
            <span className="text-sm text-gray-500">Bu ay</span>
          </CardContent>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <CardContent className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ödenen</span>
              <FileDown className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">₺125,000</p>
            <span className="text-sm text-gray-500">Bu ay</span>
          </CardContent>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <CardContent className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Bekleyen</span>
              <FileDown className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">₺45,000</p>
            <span className="text-sm text-gray-500">Bu ay</span>
          </CardContent>
        </Card>
        
        <Card className="p-4 bg-white shadow-sm">
          <CardContent className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Vadesi Geçmiş</span>
              <FileDown className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">₺15,000</p>
            <span className="text-sm text-gray-500">Bu ay</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Son Alış Faturaları</h3>
          <div className="bg-gray-50/50 rounded-lg p-4">
            <p className="text-gray-500 text-center py-8">
              Henüz alış faturası bulunmuyor
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Fatura Yönetimi</h2>
          <p className="text-gray-600">Alış ve satış faturalarınızı yönetin</p>
        </div>
        <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90">
          <Plus className="h-4 w-4" />
          <span>Yeni Fatura</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Fatura Analizi
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Satış Faturaları
          </TabsTrigger>
          <TabsTrigger value="purchase" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Alış Faturaları
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <InvoiceAnalysisTable />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {renderSalesInvoices()}
        </TabsContent>

        <TabsContent value="purchase" className="space-y-6">
          {renderPurchaseInvoices()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoicesManager;