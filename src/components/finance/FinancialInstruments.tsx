
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Filter, Download, FileText, Check, X, Bell } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const FinancialInstruments = () => {
  const [selectedType, setSelectedType] = useState("all");
  
  return (
    <div className="grid gap-4">
      {/* Özet Kartları */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tahsil Edilecek</span>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">₺275,000</p>
          <span className="text-sm text-gray-500">12 Çek/Senet</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Ödenecek</span>
            <FileText className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">₺180,000</p>
          <span className="text-sm text-gray-500">8 Çek/Senet</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Bu Ay Vadesi Gelen</span>
            <Bell className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">₺95,000</p>
          <span className="text-sm text-gray-500">5 Çek/Senet</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Karşılıksız</span>
            <X className="h-5 w-5 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-600">₺15,000</p>
          <span className="text-sm text-gray-500">2 Çek/Senet</span>
        </div>
      </div>

      {/* Çek/Senet Listesi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Çek ve Senetler</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              20 Aktif
            </span>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="check">Çekler</SelectItem>
                <SelectItem value="note">Senetler</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Dışa Aktar</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Yeni Ekle</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Çek/Senet Ekle</DialogTitle>
                  <DialogDescription>
                    Bu özellik yakında kullanıma açılacaktır.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referans No</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Vade</TableHead>
              <TableHead>Düzenleyen</TableHead>
              <TableHead>Banka</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>A123456</TableCell>
              <TableCell>Çek (Alınan)</TableCell>
              <TableCell>{format(new Date('2024-03-15'), 'dd.MM.yyyy')}</TableCell>
              <TableCell>ABC Ltd.</TableCell>
              <TableCell>Ziraat Bankası</TableCell>
              <TableCell className="text-right">₺45,000</TableCell>
              <TableCell>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Beklemede
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>Tahsil Et</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1 text-red-600">
                    <X className="h-3 w-3" />
                    <span>Karşılıksız</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>B789012</TableCell>
              <TableCell>Senet (Verilen)</TableCell>
              <TableCell>{format(new Date('2024-04-01'), 'dd.MM.yyyy')}</TableCell>
              <TableCell>XYZ A.Ş.</TableCell>
              <TableCell>İş Bankası</TableCell>
              <TableCell className="text-right">₺75,000</TableCell>
              <TableCell>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Beklemede
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>Öde</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>C345678</TableCell>
              <TableCell>Çek (Alınan)</TableCell>
              <TableCell>{format(new Date('2024-02-28'), 'dd.MM.yyyy')}</TableCell>
              <TableCell>DEF Ltd.</TableCell>
              <TableCell>Garanti BBVA</TableCell>
              <TableCell className="text-right">₺35,000</TableCell>
              <TableCell>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Tahsil Edildi
                </span>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline">Detay</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FinancialInstruments;
