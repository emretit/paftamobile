
import Navbar from "@/components/Navbar";

interface FinanceProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Finance = ({ isCollapsed, setIsCollapsed }: FinanceProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
        <div>
          <h1 className="text-3xl font-bold">Finans</h1>
          <p className="text-gray-600 mt-1">Finansal işlemler ve raporlar</p>
        </div>
      </main>
    </div>
  );
};

export default Finance;
