
import SummaryCards from "./summary/SummaryCards";
import AnalyticsSection from "./summary/AnalyticsSection";

const CrmSummary = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Summary Cards Row */}
      <SummaryCards />

      {/* Analytics Section */}
      <AnalyticsSection />
    </div>
  );
};

export default CrmSummary;
