
import Navbar from "@/components/Navbar";

interface PurchaseInvoicesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const PurchaseInvoices = ({ isCollapsed, setIsCollapsed }: PurchaseInvoicesProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
        <div>
          <h1 className="text-3xl font-bold">Alış Faturaları</h1>
          <p className="text-gray-600 mt-1">Alış faturalarının yönetimi</p>
        </div>
      </main>
    </div>
  );
};

export default PurchaseInvoices;
