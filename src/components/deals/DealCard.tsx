
import { Card } from "@/components/ui/card";
import { Deal } from "@/types/deal";

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
  dragHandleProps?: any;
}

const DealCard = ({ deal, onClick, ...dragHandleProps }: DealCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card
      {...dragHandleProps}
      className="p-4 cursor-move bg-white hover:shadow-md transition-shadow"
      onClick={() => onClick(deal)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{deal.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(deal.priority)}`}>
          {deal.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{deal.customerName}</p>
      <div className="text-xs text-gray-500 mb-2">{deal.employeeName}</div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-lg font-semibold text-gray-900">
          ${deal.value.toLocaleString()}
        </p>
        <span className="text-xs text-gray-500">
          {new Date(deal.lastContactDate).toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
};

export default DealCard;
