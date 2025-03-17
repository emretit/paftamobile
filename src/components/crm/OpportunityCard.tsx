
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Draggable } from "@hello-pangea/dnd";
import { Opportunity, opportunityStatusColors } from "@/types/crm";
import { CalendarIcon, DollarSign, User } from "lucide-react";
import { format } from 'date-fns';

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  onClick: () => void;
  isSelected?: boolean;
}

const OpportunityCard = ({ opportunity, index, onClick, isSelected = false }: OpportunityCardProps) => {
  return (
    <Draggable draggableId={opportunity.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? "opacity-75" : ""}`}
        >
          <Card 
            className={`${isSelected ? "border-red-500 border-2" : ""} 
                      hover:border-red-300 hover:shadow-md transition-all duration-200 cursor-pointer`}
            onClick={onClick}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 line-clamp-2">{opportunity.title}</h3>
                <Badge className="ml-2 flex-shrink-0" variant="outline">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(opportunity.value)}
                </Badge>
              </div>
              
              {opportunity.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{opportunity.description}</p>
              )}
              
              <div className="flex items-center mt-3 text-xs text-gray-500">
                {opportunity.expected_close_date && (
                  <div className="flex items-center mr-3">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>{format(new Date(opportunity.expected_close_date), 'dd MMM yyyy')}</span>
                  </div>
                )}
                
                {opportunity.customer && (
                  <div className="flex items-center overflow-hidden">
                    <User className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{opportunity.customer.name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <Badge className={opportunityStatusColors[opportunity.priority]} variant="secondary">
                  {opportunity.priority === 'high' ? 'Yüksek' : 
                   opportunity.priority === 'medium' ? 'Orta' : 'Düşük'}
                </Badge>
                
                {opportunity.employee && (
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="truncate">
                      {opportunity.employee.first_name} {opportunity.employee.last_name}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default OpportunityCard;
