
import DefaultLayout from "@/components/layouts/DefaultLayout";
import CrmSummary from "@/components/crm/CrmSummary";

interface CrmDashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CrmDashboard = ({ isCollapsed, setIsCollapsed }: CrmDashboardProps) => {
  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="CRM Kontrol Paneli"
      subtitle="Fırsatlar, Teklifler ve Görevlere genel bakış"
    >
      <div className="container mx-auto py-6">
        <CrmSummary />
      </div>
    </DefaultLayout>
  );
};

export default CrmDashboard;
