
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
  Banknote,
  Link,
  CreditCard,
  Receipt,
  TrendingUp,
  Download,
  Plus,
  CalendarClock,
  ArrowDownToLine,
  ArrowUpToLine,
  Globe,
  Bell,
  Filter,
} from "lucide-react";
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

const BankAccounts = () => {
  return (
    <div className="grid gap-4">
      {/* Banka Hesapları Özet */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Toplam Bakiye</span>
            <Banknote className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">₺350,000</p>
          <span className="text-sm text-gray-500">Tüm Hesaplar</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Vadesiz Hesaplar</span>
            <CreditCard className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">₺125,000</p>
          <span className="text-sm text-gray-500">4 Hesap</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Vadeli Hesaplar</span>
            <Receipt className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">₺225,000</p>
          <span className="text-sm text-gray-500">2 Hesap</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Kredi Limiti</span>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">₺500,000</p>
          <span className="text-sm text-gray-500">Toplam Limit</span>
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-auto py-4 w-full flex flex-col items-center gap-2">
                <ArrowUpToLine className="h-5 w-5 text-blue-500" />
                <span>Para Gönder</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Para Gönder</DialogTitle>
                <DialogDescription>
                  Bu özellik yakında kullanıma açılacaktır.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-auto py-4 w-full flex flex-col items-center gap-2">
                <ArrowDownToLine className="h-5 w-5 text-green-500" />
                <span>Para Al</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Para Al</DialogTitle>
                <DialogDescription>
                  Bu özellik yakında kullanıma açılacaktır.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-auto py-4 w-full flex flex-col items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" />
                <span>Swift</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Swift Transfer</DialogTitle>
                <DialogDescription>
                  Bu özellik yakında kullanıma açılacaktır.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-auto py-4 w-full flex flex-col items-center gap-2">
                <CalendarClock className="h-5 w-5 text-orange-500" />
                <span>Düzenli Ödeme</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Düzenli Ödeme Talimatı</DialogTitle>
                <DialogDescription>
                  Bu özellik yakında kullanıma açılacaktır.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bekleyen İşlemler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Bekleyen İşlemler</h3>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">3 Bekleyen</span>
          </div>
          <Button variant="outline" size="sm">Tümünü Görüntüle</Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İşlem Tarihi</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Alıcı/Gönderen</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>05.03.2024</TableCell>
              <TableCell>Düzenli Ödeme</TableCell>
              <TableCell>ABC Ltd.</TableCell>
              <TableCell>Kira Ödemesi - Mart 2024</TableCell>
              <TableCell className="text-right text-red-600">-₺25,000</TableCell>
              <TableCell>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Onay Bekliyor
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Onayla</Button>
                  <Button size="sm" variant="outline" className="text-red-600">İptal</Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>06.03.2024</TableCell>
              <TableCell>Swift</TableCell>
              <TableCell>XYZ GmbH</TableCell>
              <TableCell>İthalat Ödemesi</TableCell>
              <TableCell className="text-right text-red-600">-€15,000</TableCell>
              <TableCell>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Onay Bekliyor
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Onayla</Button>
                  <Button size="sm" variant="outline" className="text-red-600">İptal</Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Banka Hesapları Listesi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <h3 className="font-semibold">Banka Hesapları</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span>Hesap Bağla</span>
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Yeni Hesap</span>
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banka</TableHead>
              <TableHead>Hesap No</TableHead>
              <TableHead>IBAN</TableHead>
              <TableHead>Hesap Türü</TableHead>
              <TableHead>Para Birimi</TableHead>
              <TableHead className="text-right">Bakiye</TableHead>
              <TableHead>Son İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Ziraat Bankası</TableCell>
              <TableCell>1234567</TableCell>
              <TableCell>TR12 0001 0012 3456 7890 1234 56</TableCell>
              <TableCell>Vadesiz</TableCell>
              <TableCell>TRY</TableCell>
              <TableCell className="text-right">₺85,000</TableCell>
              <TableCell>01.03.2024</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>İş Bankası</TableCell>
              <TableCell>7654321</TableCell>
              <TableCell>TR98 0006 4000 0011 2233 4455 66</TableCell>
              <TableCell>Vadeli</TableCell>
              <TableCell>USD</TableCell>
              <TableCell className="text-right">$75,000</TableCell>
              <TableCell>29.02.2024</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Garanti BBVA</TableCell>
              <TableCell>9876543</TableCell>
              <TableCell>TR45 0006 2000 1234 5678 9012 34</TableCell>
              <TableCell>Vadesiz</TableCell>
              <TableCell>EUR</TableCell>
              <TableCell className="text-right">€40,000</TableCell>
              <TableCell>28.02.2024</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Son İşlemler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">Son İşlemler</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Bu Ay: 24 İşlem</span>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İşlemler</SelectItem>
                <SelectItem value="incoming">Gelen</SelectItem>
                <SelectItem value="outgoing">Giden</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Ekstre İndir</span>
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Hesap</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead>Bakiye</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>01.03.2024</TableCell>
              <TableCell>EFT Gelen</TableCell>
              <TableCell>Müşteri Ödemesi</TableCell>
              <TableCell>Ziraat - 1234</TableCell>
              <TableCell className="text-right text-green-600">+₺15,000</TableCell>
              <TableCell>₺85,000</TableCell>
              <TableCell>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Tamamlandı
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>29.02.2024</TableCell>
              <TableCell>Havale Giden</TableCell>
              <TableCell>Tedarikçi Ödemesi</TableCell>
              <TableCell>İş Bank - 7654</TableCell>
              <TableCell className="text-right text-red-600">-$5,000</TableCell>
              <TableCell>$75,000</TableCell>
              <TableCell>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Tamamlandı
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>28.02.2024</TableCell>
              <TableCell>Swift Gelen</TableCell>
              <TableCell>İhracat Bedeli</TableCell>
              <TableCell>Garanti - 9876</TableCell>
              <TableCell className="text-right text-green-600">+€10,000</TableCell>
              <TableCell>€40,000</TableCell>
              <TableCell>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Tamamlandı
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BankAccounts;
