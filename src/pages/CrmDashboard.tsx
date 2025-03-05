
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import CrmSummary from "@/components/crm/CrmSummary";

interface CrmDashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CrmDashboard = ({ isCollapsed, setIsCollapsed }: CrmDashboardProps) => {
  const navigate = useNavigate();

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="CRM"
      subtitle="Fırsatlar, Aktiviteler ve Teklifler özeti"
    >
      <div className="container mx-auto py-6">
        <CrmSummary />
      </div>
    </DefaultLayout>
  );
};

export default CrmDashboard;
