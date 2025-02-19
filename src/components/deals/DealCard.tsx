
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Deal } from "@/types/deal";
import DealActionSheet from "./DealActionSheet";

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
  onSelect?: (deal: Deal) => void;
  isSelected?: boolean;
  dragHandleProps?: any;
}

const DealCard = ({ deal, onClick, onSelect, isSelected, ...dragHandleProps }: DealCardProps) => {
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

  const handleAddNote = (note: string) => {
    console.log("Adding note:", note);
  };

  const handleAddReminder = (reminder: { date: Date; note: string }) => {
    console.log("Adding reminder:", reminder);
  };

  const handleSendEmail = (subject: string, message: string) => {
    console.log("Sending email:", { subject, message });
  };

  return (
    <Card
      {...dragHandleProps}
      className="p-4 cursor-move bg-white hover:shadow-md transition-all duration-200 border border-border/50 hover:border-border group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2">
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(deal)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}
          <div onClick={() => onClick(deal)} className="cursor-pointer">
            <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
              {deal.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{deal.customerName}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(deal.priority)}`}>
          {deal.priority === "high" ? "Yüksek" : deal.priority === "medium" ? "Orta" : "Düşük"}
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-2">{deal.employeeName}</div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-lg font-semibold text-gray-900">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(deal.value)}
        </p>
        <span className="text-xs text-gray-500">
          {new Date(deal.lastContactDate).toLocaleDateString('tr-TR')}
        </span>
      </div>
      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DealActionSheet
          deal={deal}
          onAddNote={handleAddNote}
          onAddReminder={handleAddReminder}
          onSendEmail={handleSendEmail}
        />
      </div>
    </Card>
  );
};

export default DealCard;
