
import { format } from "date-fns";
import type { Deal } from "@/types/deal";

interface DealDatesProps {
  deal: Deal;
}

const formatDate = (date: Date) => {
  return format(new Date(date), 'PP');
};

export const DealDates = ({ deal }: DealDatesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <h3 className="font-medium text-gray-600 mb-1">Teklif Tarihi</h3>
        <p>{formatDate(deal.proposalDate)}</p>
      </div>
      <div>
        <h3 className="font-medium text-gray-600 mb-1">Son İletişim</h3>
        <p>{formatDate(deal.lastContactDate)}</p>
      </div>
      {deal.expectedCloseDate && (
        <div>
          <h3 className="font-medium text-gray-600 mb-1">Tahmini Kapanış</h3>
          <p>{formatDate(deal.expectedCloseDate)}</p>
        </div>
      )}
    </div>
  );
};
