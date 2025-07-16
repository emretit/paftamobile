import FinancialOverview from "@/components/dashboard/FinancialOverview";
import InvoicesManager from "@/components/cashflow/InvoicesManager";

const CashflowOverview = () => {
  return (
    <div className="space-y-8">
      {/* Comprehensive Financial Overview */}
      <FinancialOverview />
      
      {/* Invoice Analysis */}
      <InvoicesManager />
    </div>
  );
};

export default CashflowOverview;