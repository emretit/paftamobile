
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Wallet, FileText, TrendingUp, Receipt, PieChart } from "lucide-react";

interface FinanceProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Finance = ({ isCollapsed, setIsCollapsed }: FinanceProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Başlık ve Üst Bilgiler */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Finans Yönetimi
              </h1>
              <p className="text-gray-600">
                Finansal işlemler ve raporlar
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4" />
                <span>Yeni Gelir</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Yeni Gider</span>
              </Button>
            </div>
          </div>

          {/* Finansal Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Nakit Akışı</span>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">₺50,000</p>
              <span className="text-sm text-gray-500">Bu ay</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Alacaklar</span>
                <Receipt className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">₺125,000</p>
              <span className="text-sm text-gray-500">Toplam</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Borçlar</span>
                <FileText className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600">₺75,000</p>
              <span className="text-sm text-gray-500">Toplam</span>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Net Durum</span>
                <PieChart className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600">₺100,000</p>
              <span className="text-sm text-gray-500">Genel Bakiye</span>
            </div>
          </div>

          {/* Ana Sekmeler */}
          <Tabs defaultValue="general-ledger" className="space-y-4">
            <TabsList className="bg-white border border-gray-100">
              <TabsTrigger value="general-ledger">Genel Muhasebe</TabsTrigger>
              <TabsTrigger value="accounts-receivable">Alacak Hesapları</TabsTrigger>
              <TabsTrigger value="accounts-payable">Borç Hesapları</TabsTrigger>
              <TabsTrigger value="cash-flow">Nakit Akışı</TabsTrigger>
              <TabsTrigger value="reports">Raporlar</TabsTrigger>
            </TabsList>

            {/* Genel Muhasebe Sekmesi */}
            <TabsContent value="general-ledger">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Son İşlemler</h2>
                  <Button variant="outline" size="sm">
                    Tümünü Gör
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>01.03.2024</TableCell>
                      <TableCell>Satış Geliri</TableCell>
                      <TableCell>Gelir</TableCell>
                      <TableCell className="text-right text-green-600">+₺5,000</TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Tamamlandı
                        </span>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>28.02.2024</TableCell>
                      <TableCell>Kira Ödemesi</TableCell>
                      <TableCell>Gider</TableCell>
                      <TableCell className="text-right text-red-600">-₺3,500</TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Tamamlandı
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Diğer sekmeler için yer tutucular */}
            <TabsContent value="accounts-receivable">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Alacak Hesapları</h2>
                <p className="text-gray-500">Bu özellik yakında eklenecek</p>
              </div>
            </TabsContent>

            <TabsContent value="accounts-payable">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Borç Hesapları</h2>
                <p className="text-gray-500">Bu özellik yakında eklenecek</p>
              </div>
            </TabsContent>

            <TabsContent value="cash-flow">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Nakit Akışı</h2>
                <p className="text-gray-500">Bu özellik yakında eklenecek</p>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Finansal Raporlar</h2>
                <p className="text-gray-500">Bu özellik yakında eklenecek</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Finance;
