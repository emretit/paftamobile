
import Navbar from "@/components/Navbar";
import { useSalesPerformance } from "@/hooks/useSalesPerformance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProposalsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Proposals = ({ isCollapsed, setIsCollapsed }: ProposalsProps) => {
  const { data: salesPerformance, isLoading } = useSalesPerformance();

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Teklifler</h1>
            <p className="text-gray-600 mt-1">Tüm teklifleri görüntüle ve yönet</p>
          </div>

          {isLoading ? (
            <div className="text-center">Yükleniyor...</div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Toplam Teklif</TableHead>
                    <TableHead>Kabul Edilen</TableHead>
                    <TableHead>Toplam Değer</TableHead>
                    <TableHead>Çalışan</TableHead>
                    <TableHead>Başarı Oranı</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesPerformance?.map((performance) => (
                    <TableRow key={`${performance.employee_id}-${performance.month}`}>
                      <TableCell>
                        {new Date(performance.month).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                        })}
                      </TableCell>
                      <TableCell>{performance.total_proposals}</TableCell>
                      <TableCell>{performance.accepted_proposals}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(performance.total_value)}
                      </TableCell>
                      <TableCell>{performance.employee_name}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("tr-TR", {
                          style: "percent",
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        }).format(performance.success_rate / 100)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Proposals;
