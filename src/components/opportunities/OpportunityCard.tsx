
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarClock, 
  Building, 
  DollarSign, 
  User 
} from "lucide-react";
import { Opportunity, opportunityPriorityLabels } from "@/types/crm";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick: () => void;
}

const OpportunityCard = ({ opportunity, onClick }: OpportunityCardProps) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: opportunity.currency || 'TRY'
    }).format(value);
  };

  // Format date if exists
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium line-clamp-2">{opportunity.title}</h4>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Building className="h-3 w-3 mr-1" />
              <span>{opportunity.customer_name || 'Müşteri belirtilmemiş'}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <div className={`w-2 h-2 rounded-full mr-1 ${getPriorityColor(opportunity.priority)}`}></div>
            {opportunityPriorityLabels[opportunity.priority]}
          </Badge>
        </div>

        {opportunity.value > 0 && (
          <div className="mt-2 text-sm text-gray-700 flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            <span>{formatCurrency(opportunity.value)}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          {opportunity.expected_close_date && (
            <div className="flex items-center">
              <CalendarClock className="h-3 w-3 mr-1" />
              <span>{formatDate(opportunity.expected_close_date)}</span>
            </div>
          )}
          
          {opportunity.employee_name && (
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarFallback>{opportunity.employee_name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span>{opportunity.employee_name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;
