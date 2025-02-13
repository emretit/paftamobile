
import Navbar from "@/components/Navbar";

interface ServiceProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Service = ({ isCollapsed, setIsCollapsed }: ServiceProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
        <div>
          <h1 className="text-3xl font-bold">Servis</h1>
          <p className="text-gray-600 mt-1">Servis işlemleri ve takibi</p>
        </div>
      </main>
    </div>
  );
};

export default Service;
