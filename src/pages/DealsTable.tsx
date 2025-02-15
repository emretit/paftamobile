
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DealsTable from "@/components/deals/DealsTable";
import { Deal } from "@/types/deal";
import DealDetailsModal from "@/components/deals/DealDetailsModal";
import { useToast } from "@/components/ui/use-toast";

interface DealsTablePageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const DealsTablePage = ({ isCollapsed, setIsCollapsed }: DealsTablePageProps) => {
  const { toast } = useToast();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Örnek veri - gerçek uygulamada API'den gelecek
  const [deals] = useState<Deal[]>([
    {
      id: "1",
      title: "Enterprise Software Solution",
      value: 50000,
      customerName: "Tech Corp",
      employeeName: "John Smith",
      priority: "high",
      status: "new",
      proposalDate: new Date(),
      lastContactDate: new Date(),
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: "Complete enterprise software solution including implementation and training.",
      department: "Enterprise Sales",
      contactHistory: [],
      proposalFiles: [],
      nextSteps: [],
      productServices: [],
      reminders: []
    },
    // ... Diğer örnek veriler buraya eklenebilir
  ]);

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    // Düzenleme sayfasına yönlendirme yapılacak
    console.log("Edit deal:", deal);
  };

  const handleDeleteDeal = (deal: Deal) => {
    // Silme işlemi için onay alınacak
    console.log("Delete deal:", deal);
  };

  const handleUpdateDealStatus = (deal: Deal, newStatus: Deal['status']) => {
    // Status güncelleme işlemi
    console.log("Update deal status:", deal, newStatus);
    toast({
      title: "Durum güncellendi",
      description: `${deal.title} fırsatının durumu ${newStatus} olarak güncellendi.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fırsatlar</h1>
              <p className="text-gray-600 mt-1">Tüm fırsatları görüntüleyin ve yönetin</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Fırsat
            </Button>
          </div>

          <DealsTable
            deals={deals}
            onViewDeal={handleViewDeal}
            onEditDeal={handleEditDeal}
            onDeleteDeal={handleDeleteDeal}
            onUpdateDealStatus={handleUpdateDealStatus}
          />

          <DealDetailsModal
            deal={selectedDeal}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </main>
    </div>
  );
};

export default DealsTablePage;
