
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Opportunity, opportunityPriorityLabels } from "@/types/crm";
import { CalendarIcon, User, Building, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick: (opportunity: Opportunity) => void;
  onSelect?: (opportunity: Opportunity) => void;
  isSelected?: boolean;
}

const priorityColorMap = {
  high: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
};

const formatMoney = (amount: number, currency = "₺") => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency === '₺' ? 'TRY' : currency,
    minimumFractionDigits: 0
  }).format(amount);
};

const OpportunityCard = ({ 
  opportunity, 
  onClick, 
  onSelect, 
  isSelected = false 
}: OpportunityCardProps) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick(opportunity);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(opportunity);
    }
  };

  return (
    <div 
      className={`
        p-4 mb-2 bg-white border rounded-lg shadow-sm cursor-pointer 
        hover:shadow-md transition-shadow
        ${isSelected ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}
      `}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2 items-center">
          {onSelect && (
            <div onClick={handleCheckboxClick}>
              <Checkbox checked={isSelected} />
            </div>
          )}
          <h3 className="font-medium text-gray-900 truncate max-w-[200px]">
            {opportunity.title}
          </h3>
        </div>
        <Badge 
          variant="outline"
          className={`${priorityColorMap[opportunity.priority]} text-xs`}
        >
          {opportunityPriorityLabels[opportunity.priority]}
        </Badge>
      </div>

      <div className="text-lg font-semibold text-gray-900 mb-3">
        {formatMoney(opportunity.value, opportunity.currency)}
      </div>

      <div className="flex flex-col space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-400" />
          <span className="truncate max-w-[230px]">
            {opportunity.customer_name || "Atanmamış"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="truncate max-w-[230px]">
            {opportunity.employee_name || "Atanmamış"}
          </span>
        </div>

        {opportunity.expected_close_date && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span>
              {format(new Date(opportunity.expected_close_date), "d MMM yyyy", { locale: tr })}
            </span>
          </div>
        )}
      </div>

      {opportunity.proposal_id && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <a 
            href={`/proposals/detail/${opportunity.proposal_id}`}
            className="text-xs flex items-center gap-1 text-red-700 hover:text-red-800"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3" />
            Bağlantılı teklifi görüntüle
          </a>
        </div>
      )}
    </div>
  );
};

export default OpportunityCard;
