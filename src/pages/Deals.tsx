
import Navbar from "@/components/Navbar";
import DealDetailsModal from "@/components/deals/DealDetailsModal";
import DealBulkActions from "@/components/deals/DealBulkActions";
import DealsHeader from "@/components/deals/DealsHeader";
import DealsKanban from "@/components/deals/DealsKanban";
import { useDeals } from "@/hooks/useDeals";

interface DealsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Deals = ({ isCollapsed, setIsCollapsed }: DealsProps) => {
  const {
    deals,
    selectedDeal,
    isModalOpen,
    selectedDeals,
    handleDragEnd,
    handleDealClick,
    handleDealSelect,
    handleBulkStatusUpdate,
    setIsModalOpen,
    setSelectedDeals,
  } = useDeals();

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main 
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-[60px]' : 'ml-[60px] sm:ml-64'
        }`}
      >
        <div className="p-6">
          <DealsHeader />
          <DealsKanban
            deals={deals}
            onDragEnd={handleDragEnd}
            onDealClick={handleDealClick}
            onDealSelect={handleDealSelect}
            selectedDeals={selectedDeals}
          />
          
          <DealDetailsModal
            deal={selectedDeal}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />

          <DealBulkActions
            selectedDeals={selectedDeals}
            onUpdateStatus={handleBulkStatusUpdate}
            onClearSelection={() => setSelectedDeals([])}
          />
        </div>
      </main>
    </div>
  );
};

export default Deals;
