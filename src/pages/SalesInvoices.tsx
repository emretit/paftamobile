
import Navbar from "@/components/Navbar";

interface SalesInvoicesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const SalesInvoices = ({ isCollapsed, setIsCollapsed }: SalesInvoicesProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
        <div>
          <h1 className="text-3xl font-bold">Satış Faturaları</h1>
          <p className="text-gray-600 mt-1">Satış faturalarının yönetimi</p>
        </div>
      </main>
    </div>
  );
};

export default SalesInvoices;
